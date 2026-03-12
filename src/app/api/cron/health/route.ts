import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron (or allow in development)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Simple query to keep the database active
    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Database health check failed:', error);
      return NextResponse.json(
        { status: 'unhealthy', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      rowsFound: data?.length ?? 0,
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { status: 'error', error: String(error) },
      { status: 500 }
    );
  }
}
