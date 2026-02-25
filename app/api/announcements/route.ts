import { NextRequest, NextResponse } from 'next/server';
import { allQuery, runQuery, getQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');

    let sql = `
      SELECT a.*, t.firstName, t.lastName, c.name as courseName
      FROM announcements a
      LEFT JOIN teachers t ON a.teacherId = t.id
      LEFT JOIN courses c ON a.courseId = c.id
    `;
    let params: any[] = [];

    if (courseId) {
      sql += ' WHERE a.courseId = ?';
      params.push(courseId);
    }

    sql += ' ORDER BY a.createdAt DESC';

    const announcements = await allQuery(sql, params);
    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, courseId, teacherId, priority } = body;

    if (!title || !content || !courseId || !teacherId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await runQuery(
      `INSERT INTO announcements (title, content, courseId, teacherId, priority)
       VALUES (?, ?, ?, ?, ?)`,
      [title, content, courseId, teacherId, priority || 'normal']
    );

    return NextResponse.json({ id: result.lastID, message: 'Announcement created' }, { status: 201 });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}
