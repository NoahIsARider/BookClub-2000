import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('reading_rooms')
    .select('id, name, book_title, author, description, invite_code, created_by, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`查询失败: ${error.message}`);
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, book_title, author, description, created_by } = body;

  if (!name || !book_title || !created_by) {
    return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
  }

  const invite_code = Math.random().toString(36).substring(2, 8).toUpperCase();

  const client = getSupabaseClient();
  const { data, error } = await client
    .from('reading_rooms')
    .insert({ name, book_title, author, description, invite_code, created_by })
    .select()
    .single();
  if (error) throw new Error(`创建失败: ${error.message}`);

  // Auto-add creator as member
  const colors = ['#0000FF', '#FF0000', '#008000', '#800080', '#FF6600', '#006666'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const { error: memberError } = await client
    .from('room_members')
    .insert({ room_id: data.id, nickname: created_by, color });
  if (memberError) throw new Error(`添加成员失败: ${memberError.message}`);

  return NextResponse.json({ data }, { status: 201 });
}
