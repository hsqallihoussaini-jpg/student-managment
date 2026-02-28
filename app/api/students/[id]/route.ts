import { NextRequest, NextResponse } from 'next/server';
import { getQuery, runQuery, allQuery } from '@/lib/db';
import { getServerSession } from 'next-auth/next';

async function checkAuth() {
  const session = await getServerSession();
  if (!session) {
    return null;
  }
  return session;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const student = await getQuery('SELECT * FROM students WHERE id = ?', [id]);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json({ error: 'Error fetching student' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    await runQuery(
      `UPDATE students 
       SET firstName = ?, lastName = ?, email = ?, phone = ?, matricule = ?, dateOfBirth = ?, address = ?, city = ?, zipCode = ?, country = ?, status = ?
       WHERE id = ?`,
      [
        data.firstName,
        data.lastName,
        data.email,
        data.phone,
        data.matricule,
        data.dateOfBirth,
        data.address,
        data.city,
        data.zipCode,
        data.country,
        data.status || 'active',
        id,
      ]
    );

    const updatedStudent = await getQuery('SELECT * FROM students WHERE id = ?', [id]);
    return NextResponse.json(updatedStudent);
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({ error: 'Error updating student' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await runQuery('DELETE FROM students WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ error: 'Error deleting student' }, { status: 500 });
  }
}
