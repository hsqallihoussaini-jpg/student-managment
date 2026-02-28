import { NextRequest, NextResponse } from 'next/server';
import { getQuery, runQuery } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const attendance = await getQuery(
      `SELECT a.*, s.firstName, s.lastName, c.name as courseName
       FROM attendance a
       LEFT JOIN students s ON a.studentId = s.id
       LEFT JOIN courses c ON a.courseId = c.id
       WHERE a.id = ?`,
      [id]
    );

    if (!attendance) {
      return NextResponse.json({ error: 'Attendance not found' }, { status: 404 });
    }

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    await runQuery(
      `UPDATE attendance SET status = ?, notes = ?, markedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, notes || '', id]
    );

    return NextResponse.json({ message: 'Attendance updated' });
  } catch (error) {
    console.error('Error updating attendance:', error);
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
  }
}
