import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: chapterId } = await params;
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('discussions')
    .select('*, room_members(nickname, color)')
    .eq('chapter_id', chapterId)
    .is('parent_id', null)
    .order('created_at', { ascending: true });
  if (error) throw new Error(`查询失败: ${error.message}`);

  // Get replies for each top-level discussion
  const topLevel = data || [];
  const allIds = topLevel.map((d: { id: string }) => d.id);

  let replies: Array<{ id: string; chapter_id: string; member_id: string; parent_id: string; content: string; created_at: string; room_members: { nickname: string; color: string } }> = [];
  if (allIds.length > 0) {
    const { data: repliesData, error: repliesError } = await client
      .from('discussions')
      .select('*, room_members(nickname, color)')
      .in('parent_id', allIds)
      .order('created_at', { ascending: true });
    if (repliesError) throw new Error(`查询回复失败: ${repliesError.message}`);
    replies = repliesData || [];
  }

  const result = topLevel.map((item: { id: string; chapter_id: string; member_id: string; parent_id: string | null; content: string; created_at: string; room_members: { nickname: string; color: string } }) => ({
    ...item,
    replies: replies.filter((r) => r.parent_id === item.id),
  }));

  return NextResponse.json({ data: result });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: chapterId } = await params;
  const body = await request.json();
  const { member_id, content, parent_id } = body;

  if (!member_id || !content) {
    return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
  }

  const client = getSupabaseClient();
  const { data, error } = await client
    .from('discussions')
    .insert({
      chapter_id: chapterId,
      member_id,
      content,
      parent_id: parent_id || null,
    })
    .select('*, room_members(nickname, color)')
    .single();
  if (error) throw new Error(`创建讨论失败: ${error.message}`);

  return NextResponse.json({ data }, { status: 201 });
}
