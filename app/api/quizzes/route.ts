import { NextRequest, NextResponse } from 'next/server';
import { allQuery, runQuery, getQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    const teacherId = searchParams.get('teacherId');

    let sql = `
      SELECT q.*, t.firstName, t.lastName, c.name as courseName
      FROM quizzes q
      LEFT JOIN teachers t ON q.teacherId = t.id
      LEFT JOIN courses c ON q.courseId = c.id
    `;
    let params: any[] = [];
    let conditions = [];

    if (courseId) {
      conditions.push('q.courseId = ?');
      params.push(courseId);
    }

    if (teacherId) {
      conditions.push('q.teacherId = ?');
      params.push(teacherId);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY q.dueDate DESC';

    const quizzes = await allQuery(sql, params);
    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, courseId, teacherId, dueDate, timeLimit, totalPoints } = body;

    if (!title || !courseId || !teacherId || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await runQuery(
      `INSERT INTO quizzes (title, description, courseId, teacherId, dueDate, timeLimit, totalPoints)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description || '', courseId, teacherId, dueDate, timeLimit || 60, totalPoints || 20]
    );

    return NextResponse.json({ id: result.lastID, message: 'Quiz created' }, { status: 201 });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 });
  }
}
