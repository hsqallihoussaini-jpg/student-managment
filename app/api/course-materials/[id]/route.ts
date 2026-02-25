import { NextRequest, NextResponse } from 'next/server';
import { getQuery, runQuery } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const material = await getQuery(
      `SELECT cm.*, t.firstName, t.lastName, c.name as courseName
       FROM course_materials cm
       LEFT JOIN teachers t ON cm.teacherId = t.id
       LEFT JOIN courses c ON cm.courseId = c.id
       WHERE cm.id = ?`,
      [params.id]
    );

    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    return NextResponse.json(material);
  } catch (error) {
    console.error('Error fetching material:', error);
    return NextResponse.json({ error: 'Failed to fetch material' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await runQuery('DELETE FROM course_materials WHERE id = ?', [params.id]);
    return NextResponse.json({ message: 'Material deleted' });
  } catch (error) {
    console.error('Error deleting material:', error);
    return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 });
  }
}
