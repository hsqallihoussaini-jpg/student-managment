import { NextRequest, NextResponse } from 'next/server';
import { getQuery, runQuery } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const submission = await getQuery(
      `SELECT s.*, a.title as assignmentTitle, st.firstName, st.lastName
       FROM submissions s
       LEFT JOIN assignments a ON s.assignmentId = a.id
       LEFT JOIN students st ON s.studentId = st.id
       WHERE s.id = ?`,
      [params.id]
    );

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json({ error: 'Failed to fetch submission' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { grade, feedback } = body;

    await runQuery(
      `UPDATE submissions SET grade = ?, feedback = ? WHERE id = ?`,
      [grade || null, feedback || '', params.id]
    );

    return NextResponse.json({ message: 'Submission graded' });
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
  }
}
