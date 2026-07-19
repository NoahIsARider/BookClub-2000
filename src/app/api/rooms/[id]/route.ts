import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('reading_rooms')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(`查询失败: ${error.message}`);
  if (!data) return NextResponse.json({ error: '房间不存在' }, { status: 404 });

  // Get members
  const { data: members, error: membersError } = await client
    .from('room_members')
    .select('id, nickname, color, joined_at')
    .eq('room_id', id)
    .order('joined_at');
  if (membersError) throw new Error(`查询成员失败: ${membersError.message}`);

  // Get chapters
  const { data: chapters, error: chaptersError } = await client
    .from('chapters')
    .select('id, title, sort_order, created_at')
    .eq('room_id', id)
    .order('sort_order');
  if (chaptersError) throw new Error(`查询章节失败: ${chaptersError.message}`);

  return NextResponse.json({ data: { ...data, members: members || [], chapters: chapters || [] } });
}
