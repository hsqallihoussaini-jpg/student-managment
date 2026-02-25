import { NextRequest, NextResponse } from 'next/server';
import { getQuery, runQuery } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const notification = await getQuery(
      `SELECT n.*, c.name as courseName
       FROM notifications n
       LEFT JOIN courses c ON n.courseId = c.id
       WHERE n.id = ?`,
      [params.id]
    );

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error fetching notification:', error);
    return NextResponse.json({ error: 'Failed to fetch notification' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { isRead } = body;

    await runQuery(
      `UPDATE notifications SET isRead = ? WHERE id = ?`,
      [isRead ? 1 : 0, params.id]
    );

    return NextResponse.json({ message: 'Notification updated' });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
