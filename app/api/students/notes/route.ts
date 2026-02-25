import { NextRequest, NextResponse } from 'next/server';
import { allQuery, runQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const studentId = request.nextUrl.searchParams.get('studentId');
    
    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 }
      );
    }

    const notes = await allQuery(
      `SELECT sn.*, c.name as courseName, c.code as courseCode
       FROM student_notes sn
       JOIN courses c ON sn.courseId = c.id
       WHERE sn.studentId = ?
       ORDER BY sn.updatedAt DESC`,
      [parseInt(studentId)]
    );

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching student notes:', error);
    return NextResponse.json(
      { error: 'Error fetching student notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { studentId, courseId, title, content } = data;

    if (!studentId || !courseId || !title) {
      return NextResponse.json(
        { error: 'studentId, courseId, and title are required' },
        { status: 400 }
      );
    }

    const result = await runQuery(
      `INSERT INTO student_notes (studentId, courseId, title, content)
       VALUES (?, ?, ?, ?)`,
      [studentId, courseId, title, content || '']
    );

    return NextResponse.json(
      { message: 'Note created successfully', noteId: result.lastID },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating student note:', error);
    return NextResponse.json(
      { error: 'Error creating student note' },
      { status: 500 }
    );
  }
}
