import { NextRequest, NextResponse } from 'next/server';
import { allQuery, runQuery, getQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    const studentId = searchParams.get('studentId');

    let sql = `
      SELECT a.*, t.firstName, t.lastName, c.name as courseName
      FROM assignments a
      LEFT JOIN teachers t ON a.teacherId = t.id
      LEFT JOIN courses c ON a.courseId = c.id
    `;
    let params: any[] = [];

    if (courseId) {
      sql += ' WHERE a.courseId = ?';
      params.push(courseId);
    }

    sql += ' ORDER BY a.dueDate DESC';

    const assignments = await allQuery(sql, params);
    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, courseId, teacherId, dueDate, maxScore } = body;

    if (!title || !courseId || !teacherId || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await runQuery(
      `INSERT INTO assignments (title, description, courseId, teacherId, dueDate, maxScore)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description || '', courseId, teacherId, dueDate, maxScore || 20]
    );

    return NextResponse.json({ id: result.lastID, message: 'Assignment created' }, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}
