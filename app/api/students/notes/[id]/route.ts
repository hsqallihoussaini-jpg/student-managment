import { NextRequest, NextResponse } from 'next/server';
import { runQuery, getQuery } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const noteId = parseInt(id);
    const data = await request.json();
    const { title, content } = data;

    if (!title) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      );
    }

    await runQuery(
      `UPDATE student_notes SET title = ?, content = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, content || '', noteId]
    );

    return NextResponse.json({ message: 'Note updated successfully' });
  } catch (error) {
    console.error('Error updating student note:', error);
    return NextResponse.json(
      { error: 'Error updating student note' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const noteId = parseInt(id);

    await runQuery(
      'DELETE FROM student_notes WHERE id = ?',
      [noteId]
    );

    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting student note:', error);
    return NextResponse.json(
      { error: 'Error deleting student note' },
      { status: 500 }
    );
  }
}
