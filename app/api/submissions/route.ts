import { NextRequest, NextResponse } from 'next/server';
import { allQuery, runQuery, getQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const assignmentId = searchParams.get('assignmentId');
    const studentId = searchParams.get('studentId');

    let sql = `
      SELECT s.*, a.title as assignmentTitle, st.firstName, st.lastName, st.email
      FROM submissions s
      LEFT JOIN assignments a ON s.assignmentId = a.id
      LEFT JOIN students st ON s.studentId = st.id
    `;
    let params: any[] = [];
    let conditions = [];

    if (assignmentId) {
      conditions.push('s.assignmentId = ?');
      params.push(assignmentId);
    }

    if (studentId) {
      conditions.push('s.studentId = ?');
      params.push(studentId);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY s.submittedAt DESC';

    const submissions = await allQuery(sql, params);
    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignmentId, studentId, fileName, fileContent } = body;

    if (!assignmentId || !studentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await runQuery(
      `INSERT INTO submissions (assignmentId, studentId, fileName, fileContent, submittedAt)
       VALUES (?, ?, ?, ?, datetime('now'))`,
      [assignmentId, studentId, fileName || '', fileContent || '']
    );

    return NextResponse.json({ id: result.lastID, message: 'Submission created' }, { status: 201 });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
  }
}
