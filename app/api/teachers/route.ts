import { NextResponse } from 'next/server';
import { allQuery, getQuery, runQuery } from '@/lib/db';

export async function GET() {
  try {
    const teachers = await allQuery('SELECT * FROM teachers');
    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { error: 'Error fetching teachers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { firstName, lastName, email, phone, department, specialization, office } = data;

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, firstName, and lastName are required' },
        { status: 400 }
      );
    }

    const result = await runQuery(
      `INSERT INTO teachers (firstName, lastName, email, phone, department, specialization, office) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, phone || null, department || null, specialization || null, office || null]
    );

    return NextResponse.json(
      { message: 'Teacher created successfully', teacherId: result.lastID },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json(
      { error: 'Error creating teacher' },
      { status: 500 }
    );
  }
}
