import { NextRequest, NextResponse } from 'next/server';
import { allQuery, runQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const studentId = request.nextUrl.searchParams.get('studentId');
    
    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 }
      );
    }

    const schedule = await allQuery(
      `SELECT ss.*, c.name as courseName, c.code as courseCode
       FROM student_schedule ss
       JOIN courses c ON ss.courseId = c.id
       WHERE ss.studentId = ?
       ORDER BY 
         CASE ss.dayOfWeek 
           WHEN 'Lundi' THEN 1
           WHEN 'Mardi' THEN 2
           WHEN 'Mercredi' THEN 3
           WHEN 'Jeudi' THEN 4
           WHEN 'Vendredi' THEN 5
           WHEN 'Samedi' THEN 6
           WHEN 'Dimanche' THEN 7
         END,
         ss.startTime`,
      [parseInt(studentId)]
    );

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error fetching student schedule:', error);
    return NextResponse.json(
      { error: 'Error fetching student schedule' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { studentId, courseId, dayOfWeek, startTime, endTime, room, instructor } = data;

    if (!studentId || !courseId || !dayOfWeek || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'studentId, courseId, dayOfWeek, startTime, and endTime are required' },
        { status: 400 }
      );
    }

    const result = await runQuery(
      `INSERT INTO student_schedule (studentId, courseId, dayOfWeek, startTime, endTime, room, instructor)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [studentId, courseId, dayOfWeek, startTime, endTime, room || '', instructor || '']
    );

    return NextResponse.json(
      { message: 'Schedule created successfully', scheduleId: result.lastID },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating student schedule:', error);
    return NextResponse.json(
      { error: 'Error creating student schedule' },
      { status: 500 }
    );
  }
}
