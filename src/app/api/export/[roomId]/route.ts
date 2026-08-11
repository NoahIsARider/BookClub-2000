import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const client = getSupabaseClient();

  // Get room info
  const { data: room, error: roomError } = await client
    .from('reading_rooms')
    .select('*')
    .eq('id', roomId)
    .maybeSingle();
  if (roomError) throw new Error(`Failed to query room: ${roomError.message}`);
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

  // Get members
  const { data: members } = await client
    .from('room_members')
    .select('id, nickname')
    .eq('room_id', roomId);

  // Get chapters with content
  const { data: chapters } = await client
    .from('chapters')
    .select('*')
    .eq('room_id', roomId)
    .order('sort_order');

  const memberMap = new Map((members || []).map((m: { id: string; nickname: string }) => [m.id, m.nickname]));

  // Get all annotations and discussions for each chapter
  const exportData = [];
  for (const chapter of (chapters || [])) {
    const { data: annotations } = await client
      .from('annotations')
      .select('*')
      .eq('chapter_id', chapter.id)
      .order('start_offset');

    const { data: discussions } = await client
      .from('discussions')
      .select('*')
      .eq('chapter_id', chapter.id)
      .is('parent_id', null)
      .order('created_at');

    // Get replies
    const discussionIds = (discussions || []).map((d: { id: string }) => d.id);
    let allReplies: Array<{ id: string; parent_id: string; content: string; member_id: string; created_at: string }> = [];
    if (discussionIds.length > 0) {
      const { data: repliesData } = await client
        .from('discussions')
        .select('id, parent_id, content, member_id, created_at')
        .in('parent_id', discussionIds)
        .order('created_at');
      allReplies = repliesData || [];
    }

    exportData.push({
      chapter: chapter.title,
      annotations: (annotations || []).map((a: { selected_text: string; comment: string; member_id: string }) => ({
        text: a.selected_text,
        comment: a.comment,
        author: memberMap.get(a.member_id) || 'Unknown',
      })),
      discussions: (discussions || []).map((d: { id: string; content: string; member_id: string; created_at: string }) => ({
        content: d.content,
        author: memberMap.get(d.member_id) || 'Unknown',
        time: d.created_at,
        replies: allReplies
          .filter((r) => r.parent_id === d.id)
          .map((r) => ({
            content: r.content,
            author: memberMap.get(r.member_id) || 'Unknown',
            time: r.created_at,
          })),
      })),
    });
  }

  const markdown = generateMarkdown(room, exportData);

  return NextResponse.json({
    data: {
      room_name: room.name,
      book_title: room.book_title,
      markdown,
    },
  });
}

function generateMarkdown(
  room: { name: string; book_title: string; author?: string | null },
  exportData: Array<{
    chapter: string;
    annotations: Array<{ text: string; comment: string; author: string }>;
    discussions: Array<{
      content: string;
      author: string;
      time: string;
      replies: Array<{ content: string; author: string; time: string }>;
    }>;
  }>
): string {
  let md = `# ${room.book_title} - Reading Notes\n\n`;
  md += `**Club**: ${room.name}\n`;
  if (room.author) md += `**Author**: ${room.author}\n`;
  md += `**Exported**: ${new Date().toLocaleString('en-US')}\n\n`;
  md += `---\n\n`;

  for (const section of exportData) {
    md += `## ${section.chapter}\n\n`;

    if (section.annotations.length > 0) {
      md += `### Highlighted Passages & Annotations\n\n`;
      for (const ann of section.annotations) {
        md += `> "${ann.text}"\n\n`;
        md += `**${ann.author}**'s annotation: ${ann.comment}\n\n`;
      }
    }

    if (section.discussions.length > 0) {
      md += `### Discussion Log\n\n`;
      for (const disc of section.discussions) {
        md += `**${disc.author}** (${new Date(disc.time).toLocaleString('zh-CN')}):\n`;
        md += `${disc.content}\n\n`;
        for (const reply of disc.replies) {
          md += `  > **${reply.author}** (${new Date(reply.time).toLocaleString('zh-CN')}): ${reply.content}\n\n`;
        }
        md += `---\n\n`;
      }
    }
  }

  return md;
}
