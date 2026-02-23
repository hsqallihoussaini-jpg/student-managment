import { NextRequest, NextResponse } from 'next/server';
import { allQuery, getQuery, runQuery } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { GET as authHandler } from '../auth/[...nextauth]/route';

async function checkAuth(request: NextRequest) {
  const session = await getServerSession({ req: request } as any);
  if (!session) {
    return null;
  }
  return session;
}

export async function GET(request: NextRequest) {
  try {
    const session = await checkAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const students = await allQuery('SELECT * FROM students');
    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Error fetching students' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await checkAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    const result = await runQuery(
      `INSERT INTO students (firstName, lastName, email, phone, matricule, dateOfBirth, address, city, zipCode, country)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.firstName,
        data.lastName,
        data.email,
        data.phone || null,
        data.matricule,
        data.dateOfBirth || null,
        data.address || null,
        data.city || null,
        data.zipCode || null,
        data.country || null,
      ]
    );

    const newStudent = await getQuery('SELECT * FROM students WHERE id = ?', [result.lastID]);
    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Error creating student' }, { status: 500 });
  }
}
