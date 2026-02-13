import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/mongodb';

export async function GET() {
  try {
    const dbHealth = await checkDatabaseHealth();
    const timestamp = new Date().toISOString();

    const health = {
      status: dbHealth ? 'healthy' : 'unhealthy',
      timestamp,
      services: {
        database: dbHealth ? 'connected' : 'disconnected',
        api: 'operational',
      },
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };

    const statusCode = dbHealth ? 200 : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

