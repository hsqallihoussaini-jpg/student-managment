import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { runQuery, getQuery } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { email, password, firstName, lastName, phone } = data;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, firstName, and lastName are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getQuery('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with student role
    const userResult = await runQuery(
      `INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)`,
      [email, hashedPassword, `${firstName} ${lastName}`, 'student']
    );

    // Create student entry
    const matricule = `STU${Date.now()}`;
    await runQuery(
      `INSERT INTO students (firstName, lastName, email, phone, matricule) VALUES (?, ?, ?, ?, ?)`,
      [firstName, lastName, email, phone || null, matricule]
    );

    return NextResponse.json(
      { message: 'Student registered successfully', userId: userResult.lastID },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering student:', error);
    return NextResponse.json(
      { error: 'Error registering student' },
      { status: 500 }
    );
  }
}
