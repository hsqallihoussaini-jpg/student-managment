import { NextRequest, NextResponse } from 'next/server';
import { allQuery, runQuery } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const teacherId = parseInt(id);

    const courses = await allQuery(
      'SELECT * FROM courses WHERE teacherId = ?',
      [teacherId]
    );

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    return NextResponse.json(
      { error: 'Error fetching teacher courses' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const teacherId = parseInt(id);
    const data = await request.json();
    const { code, name, description, credits, semester } = data;

    if (!code || !name) {
      return NextResponse.json(
        { error: 'Code and name are required' },
        { status: 400 }
      );
    }

    const result = await runQuery(
      `INSERT INTO courses (code, name, description, credits, semester, teacherId) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [code, name, description || null, credits || null, semester || null, teacherId]
    );

    return NextResponse.json(
      { message: 'Course created successfully', courseId: result.lastID },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Error creating course' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const teacherId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId is required' },
        { status: 400 }
      );
    }

    await runQuery(
      'DELETE FROM courses WHERE id = ? AND teacherId = ?',
      [parseInt(courseId), teacherId]
    );

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Error deleting course' },
      { status: 500 }
    );
  }
}
