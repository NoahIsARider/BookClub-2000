import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('chapters')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(`Query failed: ${error.message}`);
  if (!data) return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });

  return NextResponse.json({ data });
}
