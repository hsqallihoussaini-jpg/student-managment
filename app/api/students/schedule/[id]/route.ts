import { NextRequest, NextResponse } from 'next/server';
import { runQuery } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scheduleId = parseInt(params.id);
    const data = await request.json();
    const { dayOfWeek, startTime, endTime, room, instructor } = data;

    if (!dayOfWeek || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'dayOfWeek, startTime, and endTime are required' },
        { status: 400 }
      );
    }

    await runQuery(
      `UPDATE student_schedule SET dayOfWeek = ?, startTime = ?, endTime = ?, room = ?, instructor = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [dayOfWeek, startTime, endTime, room || '', instructor || '', scheduleId]
    );

    return NextResponse.json({ message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Error updating student schedule:', error);
    return NextResponse.json(
      { error: 'Error updating student schedule' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scheduleId = parseInt(params.id);

    await runQuery(
      'DELETE FROM student_schedule WHERE id = ?',
      [scheduleId]
    );

    return NextResponse.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting student schedule:', error);
    return NextResponse.json(
      { error: 'Error deleting student schedule' },
      { status: 500 }
    );
  }
}
