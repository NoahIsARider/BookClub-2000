import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: roomId } = await params;
  const body = await request.json();
  const { nickname } = body;

  if (!nickname) {
    return NextResponse.json({ error: '请输入昵称' }, { status: 400 });
  }

  const client = getSupabaseClient();

  // Check if already a member
  const { data: existing } = await client
    .from('room_members')
    .select('id')
    .eq('room_id', roomId)
    .eq('nickname', nickname)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ data: existing });
  }

  const colors = ['#0000FF', '#FF0000', '#008000', '#800080', '#FF6600', '#006666', '#CC0066', '#0066CC'];
  const { data: members } = await client
    .from('room_members')
    .select('color')
    .eq('room_id', roomId);

  const usedColors = (members || []).map((m: { color: string }) => m.color);
  const availableColors = ['#0000FF', '#FF0000', '#008000', '#800080', '#FF6600', '#006666', '#CC0066', '#0066CC']
    .filter(c => !usedColors.includes(c));
  const color = availableColors.length > 0
    ? availableColors[0]
    : colors[Math.floor(Math.random() * colors.length)];

  const { data, error } = await client
    .from('room_members')
    .insert({ room_id: roomId, nickname, color })
    .select()
    .single();
  if (error) throw new Error(`加入失败: ${error.message}`);

  return NextResponse.json({ data }, { status: 201 });
}
