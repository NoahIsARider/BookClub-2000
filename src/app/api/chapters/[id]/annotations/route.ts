import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: chapterId } = await params;
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('annotations')
    .select('*, room_members(nickname, color)')
    .eq('chapter_id', chapterId)
    .order('start_offset');
  if (error) throw new Error(`查询失败: ${error.message}`);
  return NextResponse.json({ data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: chapterId } = await params;
  const body = await request.json();
  const { member_id, selected_text, comment, start_offset, end_offset } = body;

  if (!member_id || !selected_text || !comment) {
    return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
  }

  const client = getSupabaseClient();
  const { data, error } = await client
    .from('annotations')
    .insert({
      chapter_id: chapterId,
      member_id,
      selected_text,
      comment,
      start_offset: start_offset || 0,
      end_offset: end_offset || 0,
    })
    .select('*, room_members(nickname, color)')
    .single();
  if (error) throw new Error(`创建批注失败: ${error.message}`);

  return NextResponse.json({ data }, { status: 201 });
}
