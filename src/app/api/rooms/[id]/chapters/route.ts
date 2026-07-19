import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: roomId } = await params;
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('chapters')
    .select('id, title, sort_order, created_at')
    .eq('room_id', roomId)
    .order('sort_order');
  if (error) throw new Error(`查询失败: ${error.message}`);
  return NextResponse.json({ data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: roomId } = await params;
  const body = await request.json();
  const { title, content } = body;

  if (!title || !content) {
    return NextResponse.json({ error: '标题和内容不能为空' }, { status: 400 });
  }

  const client = getSupabaseClient();

  // Get max sort_order
  const { data: existing } = await client
    .from('chapters')
    .select('sort_order')
    .eq('room_id', roomId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const sortOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { data, error } = await client
    .from('chapters')
    .insert({ room_id: roomId, title, content, sort_order: sortOrder })
    .select()
    .single();
  if (error) throw new Error(`创建失败: ${error.message}`);

  return NextResponse.json({ data }, { status: 201 });
}
