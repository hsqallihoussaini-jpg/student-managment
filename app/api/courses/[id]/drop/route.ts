import { NextRequest, NextResponse } from 'next/server';
import { getQuery, runQuery } from '@/lib/db';
import { getServerSession } from 'next-auth/next';

async function checkAuth() {
  const session = await getServerSession();
  if (!session) {
    return null;
  }
  return session;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courseId = parseInt(params.id);
    const data = await request.json();
    const { studentId } = data;

    if (!studentId || !courseId) {
      return NextResponse.json(
        { error: 'studentId and courseId are required' },
        { status: 400 }
      );
    }

    // Check if enrollment exists
    const enrollment = await getQuery(
      'SELECT * FROM enrollments WHERE studentId = ? AND courseId = ?',
      [studentId, courseId]
    );

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Delete enrollment
    await runQuery(
      'DELETE FROM enrollments WHERE studentId = ? AND courseId = ?',
      [studentId, courseId]
    );

    return NextResponse.json(
      { message: 'Dropped course successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error dropping course:', error);
    return NextResponse.json(
      { error: 'Error dropping course' },
      { status: 500 }
    );
  }
}
