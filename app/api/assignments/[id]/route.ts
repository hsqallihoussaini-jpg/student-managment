import { NextRequest, NextResponse } from 'next/server';
import { getQuery, runQuery } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assignment = await getQuery(
      `SELECT a.*, t.firstName, t.lastName, c.name as courseName
       FROM assignments a
       LEFT JOIN teachers t ON a.teacherId = t.id
       LEFT JOIN courses c ON a.courseId = c.id
       WHERE a.id = ?`,
      [id]
    );

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return NextResponse.json({ error: 'Failed to fetch assignment' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, dueDate, maxScore } = body;

    await runQuery(
      `UPDATE assignments SET title = ?, description = ?, dueDate = ?, maxScore = ?
       WHERE id = ?`,
      [title, description || '', dueDate, maxScore || 20, id]
    );

    return NextResponse.json({ message: 'Assignment updated' });
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await runQuery('DELETE FROM assignments WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Assignment deleted' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
  }
}
