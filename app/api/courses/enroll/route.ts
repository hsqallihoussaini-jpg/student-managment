import { NextRequest, NextResponse } from 'next/server';
import { allQuery, getQuery, runQuery } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return null;
  }
  return session;
}

export async function POST(request: NextRequest) {
  try {
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { studentId, courseId } = data;

    if (!studentId || !courseId) {
      return NextResponse.json(
        { error: 'studentId and courseId are required' },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existing = await getQuery(
      'SELECT * FROM enrollments WHERE studentId = ? AND courseId = ?',
      [studentId, courseId]
    );

    if (existing) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      );
    }

    // Enroll student
    const result = await runQuery(
      'INSERT INTO enrollments (studentId, courseId) VALUES (?, ?)',
      [studentId, courseId]
    );

    return NextResponse.json(
      { message: 'Enrolled successfully', enrollmentId: result.lastID },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error enrolling:', error);
    return NextResponse.json(
      { error: 'Error enrolling in course' },
      { status: 500 }
    );
  }
}
