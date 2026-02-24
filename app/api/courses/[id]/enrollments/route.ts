import { NextResponse } from 'next/server';
import { allQuery } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id);

    const enrollments = await allQuery(
      `SELECT e.*, s.firstName, s.lastName, c.name as courseName 
       FROM enrollments e 
       INNER JOIN students s ON e.studentId = s.id
       INNER JOIN courses c ON e.courseId = c.id
       WHERE e.courseId = ?`,
      [courseId]
    );

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error('Error fetching course enrollments:', error);
    return NextResponse.json(
      { error: 'Error fetching course enrollments' },
      { status: 500 }
    );
  }
}
