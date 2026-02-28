import { NextResponse } from 'next/server';
import { allQuery } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const studentId = parseInt(id);

    const courses = await allQuery(
      `SELECT c.*, e.enrolledAt 
       FROM courses c 
       INNER JOIN enrollments e ON c.id = e.courseId 
       WHERE e.studentId = ?`,
      [studentId]
    );

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching student courses:', error);
    return NextResponse.json(
      { error: 'Error fetching student courses' },
      { status: 500 }
    );
  }
}
