import { NextRequest, NextResponse } from 'next/server';
import { allQuery, runQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    const studentId = searchParams.get('studentId');
    const sessionDate = searchParams.get('sessionDate');

    let sql = `
      SELECT a.*, s.firstName, s.lastName, s.email, c.name as courseName
      FROM attendance a
      LEFT JOIN students s ON a.studentId = s.id
      LEFT JOIN courses c ON a.courseId = c.id
    `;
    let params: any[] = [];
    let conditions = [];

    if (courseId) {
      conditions.push('a.courseId = ?');
      params.push(courseId);
    }
    if (studentId) {
      conditions.push('a.studentId = ?');
      params.push(studentId);
    }
    if (sessionDate) {
      conditions.push('DATE(a.sessionDate) = DATE(?)');
      params.push(sessionDate);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY a.sessionDate DESC';

    const attendance = await allQuery(sql, params);
    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, studentId, sessionDate, status, qrCodeScanned } = body;

    if (!courseId || !studentId || !sessionDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await runQuery(
      `INSERT INTO attendance (courseId, studentId, sessionDate, status, qrCodeScanned, markedAt)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [courseId, studentId, sessionDate, status || 'present', qrCodeScanned ? 1 : 0]
    );

    return NextResponse.json({ id: result.lastID, message: 'Attendance recorded' }, { status: 201 });
  } catch (error) {
    console.error('Error recording attendance:', error);
    return NextResponse.json({ error: 'Failed to record attendance' }, { status: 500 });
  }
}
