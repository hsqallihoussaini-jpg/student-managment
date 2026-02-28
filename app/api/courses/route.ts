import { NextRequest, NextResponse } from 'next/server';
import { allQuery, getQuery, runQuery } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return null;
  }
  return session;
}

export async function GET() {
  try {
    const courses = await allQuery('SELECT * FROM courses');
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Error fetching courses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    const result = await runQuery(
      `INSERT INTO courses (code, name, description, credits, semester)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.code,
        data.name,
        data.description || null,
        data.credits || null,
        data.semester || null,
      ]
    );

    const newCourse = await getQuery('SELECT * FROM courses WHERE id = ?', [result.lastID]);
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Error creating course' }, { status: 500 });
  }
}
