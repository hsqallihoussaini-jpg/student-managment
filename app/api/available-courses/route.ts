import { NextResponse } from 'next/server';
import { allQuery } from '@/lib/db';

export async function GET() {
  try {
    const courses = await allQuery(
      'SELECT * FROM available_courses ORDER BY name'
    );
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching available courses:', error);
    return NextResponse.json(
      { error: 'Error fetching available courses' },
      { status: 500 }
    );
  }
}
