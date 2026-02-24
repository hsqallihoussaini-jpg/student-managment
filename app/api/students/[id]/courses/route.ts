import { NextResponse } from 'next/server';
import { allQuery } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = parseInt(params.id);

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
