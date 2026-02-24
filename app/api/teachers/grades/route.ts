import { NextRequest, NextResponse } from 'next/server';
import { allQuery, getQuery, runQuery } from '@/lib/db';
import { getServerSession } from 'next-auth/next';

async function checkAuth() {
  const session = await getServerSession();
  if (!session) {
    return null;
  }
  return session;
}

export async function GET(request: NextRequest) {
  try {
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const courseId = searchParams.get('courseId');

    if (!teacherId) {
      return NextResponse.json(
        { error: 'teacherId is required' },
        { status: 400 }
      );
    }

    let query = 'SELECT tn.*, s.firstName, s.lastName, c.name as courseName FROM teacher_notes tn LEFT JOIN students s ON tn.studentId = s.id LEFT JOIN courses c ON tn.courseId = c.id WHERE tn.teacherId = ?';
    let params: any[] = [parseInt(teacherId)];

    if (courseId) {
      query += ' AND tn.courseId = ?';
      params.push(parseInt(courseId));
    }

    const notes = await allQuery(query, params);
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { error: 'Error fetching grades' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { teacherId, studentId, courseId, grade, notes } = data;

    if (!teacherId || !studentId) {
      return NextResponse.json(
        { error: 'teacherId and studentId are required' },
        { status: 400 }
      );
    }

    // Check if note already exists
    const existing = await getQuery(
      'SELECT * FROM teacher_notes WHERE teacherId = ? AND studentId = ? AND courseId = ?',
      [teacherId, studentId, courseId || null]
    );

    let result;
    if (existing) {
      // Update existing
      await runQuery(
        `UPDATE teacher_notes SET grade = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP 
         WHERE teacherId = ? AND studentId = ? AND courseId = ?`,
        [grade || null, notes || null, teacherId, studentId, courseId || null]
      );
      result = existing.id;
    } else {
      // Insert new
      const insertResult = await runQuery(
        `INSERT INTO teacher_notes (teacherId, studentId, courseId, grade, notes) 
         VALUES (?, ?, ?, ?, ?)`,
        [teacherId, studentId, courseId || null, grade || null, notes || null]
      );
      result = insertResult.lastID;
    }

    return NextResponse.json(
      { message: 'Grade updated successfully', noteId: result },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving grade:', error);
    return NextResponse.json(
      { error: 'Error saving grade' },
      { status: 500 }
    );
  }
}
