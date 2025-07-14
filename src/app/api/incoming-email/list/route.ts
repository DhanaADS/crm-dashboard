import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('incoming_emails')
      .select('id, from_email, subject, body, received_at')
      .order('received_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Supabase fetch error:', error.message);
      return NextResponse.json({ inbox: [] }, { status: 500 });
    }

    const inbox = (data || []).map((item) => ({
      id: item.id,
      subject: item.subject || '(No Subject)',
      from: item.from_email || 'Unknown Sender',
      snippet: (item.body || '').slice(0, 80),
    }));

    return NextResponse.json({ inbox });
  } catch (err) {
    console.error('❌ Handler Error:', err);
    return NextResponse.json({ inbox: [] }, { status: 500 });
  }
}