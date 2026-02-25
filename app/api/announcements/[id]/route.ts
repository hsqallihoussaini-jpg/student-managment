import { NextRequest, NextResponse } from 'next/server';
import { getQuery, runQuery } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const announcement = await getQuery(
      `SELECT a.*, t.firstName, t.lastName, c.name as courseName
       FROM announcements a
       LEFT JOIN teachers t ON a.teacherId = t.id
       LEFT JOIN courses c ON a.courseId = c.id
       WHERE a.id = ?`,
      [params.id]
    );

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return NextResponse.json({ error: 'Failed to fetch announcement' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, content, priority } = body;

    await runQuery(
      `UPDATE announcements SET title = ?, content = ?, priority = ? WHERE id = ?`,
      [title, content, priority || 'normal', params.id]
    );

    return NextResponse.json({ message: 'Announcement updated' });
  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await runQuery('DELETE FROM announcements WHERE id = ?', [params.id]);
    return NextResponse.json({ message: 'Announcement deleted' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
  }
}
