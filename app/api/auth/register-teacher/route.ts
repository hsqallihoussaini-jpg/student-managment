import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { runQuery, getQuery } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { email, password, firstName, lastName, phone, department, specialization, office } = data;

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

    // Create user with teacher role
    const userResult = await runQuery(
      `INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)`,
      [email, hashedPassword, `${firstName} ${lastName}`, 'teacher']
    );

    // Create teacher entry
    await runQuery(
      `INSERT INTO teachers (firstName, lastName, email, phone, department, specialization, office) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, phone || null, department || null, specialization || null, office || null]
    );

    return NextResponse.json(
      { message: 'Teacher registered successfully', userId: userResult.lastID },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering teacher:', error);
    return NextResponse.json(
      { error: 'Error registering teacher' },
      { status: 500 }
    );
  }
}
