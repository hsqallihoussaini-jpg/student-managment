import { NextRequest, NextResponse } from 'next/server';
import { allQuery, runQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');

    let sql = `
      SELECT cm.*, t.firstName, t.lastName, c.name as courseName
      FROM course_materials cm
      LEFT JOIN teachers t ON cm.teacherId = t.id
      LEFT JOIN courses c ON cm.courseId = c.id
    `;
    let params: any[] = [];

    if (courseId) {
      sql += ' WHERE cm.courseId = ?';
      params.push(courseId);
    }

    sql += ' ORDER BY cm.createdAt DESC';

    const materials = await allQuery(sql, params);
    return NextResponse.json(materials);
  } catch (error) {
    console.error('Error fetching course materials:', error);
    return NextResponse.json({ error: 'Failed to fetch materials' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, teacherId, title, description, type, fileName, fileUrl, fileSize, duration } = body;

    if (!courseId || !teacherId || !title || !fileName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await runQuery(
      `INSERT INTO course_materials (courseId, teacherId, title, description, type, fileName, fileUrl, fileSize, duration)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [courseId, teacherId, title, description || '', type || 'pdf', fileName, fileUrl || '', fileSize || 0, duration || 0]
    );

    return NextResponse.json({ id: result.lastID, message: 'Material created' }, { status: 201 });
  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json({ error: 'Failed to create material' }, { status: 500 });
  }
}
