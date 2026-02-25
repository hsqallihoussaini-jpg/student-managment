import { NextRequest, NextResponse } from 'next/server';
import { allQuery, runQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    let sql = `
      SELECT n.*, c.name as courseName
      FROM notifications n
      LEFT JOIN courses c ON n.courseId = c.id
    `;
    let params: any[] = [];
    let conditions = [];

    if (studentId) {
      conditions.push('n.studentId = ?');
      params.push(studentId);
    }
    if (unreadOnly) {
      conditions.push('n.isRead = 0');
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY n.createdAt DESC';

    const notifications = await allQuery(sql, params);
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, courseId, title, message, type, actionUrl } = body;

    if (!studentId || !title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await runQuery(
      `INSERT INTO notifications (studentId, courseId, title, message, type, actionUrl)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [studentId, courseId || null, title, message, type || 'info', actionUrl || null]
    );

    return NextResponse.json({ id: result.lastID, message: 'Notification created' }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
