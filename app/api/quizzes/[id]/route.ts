import { NextRequest, NextResponse } from 'next/server';
import { getQuery, allQuery, runQuery } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quiz = await getQuery(
      `SELECT q.*, t.firstName, t.lastName, c.name as courseName
       FROM quizzes q
       LEFT JOIN teachers t ON q.teacherId = t.id
       LEFT JOIN courses c ON q.courseId = c.id
       WHERE q.id = ?`,
      [params.id]
    );

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Get questions
    const questions = await allQuery(
      `SELECT id, quizId, questionText, questionType, options, points FROM quiz_questions WHERE quizId = ?`,
      [params.id]
    );

    // Parse options JSON
    const parsedQuestions = questions.map((q: any) => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : []
    }));

    return NextResponse.json({ ...quiz, questions: parsedQuestions });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, description, dueDate, timeLimit, totalPoints } = body;

    await runQuery(
      `UPDATE quizzes SET title = ?, description = ?, dueDate = ?, timeLimit = ?, totalPoints = ?
       WHERE id = ?`,
      [title, description || '', dueDate, timeLimit || 60, totalPoints || 20, params.id]
    );

    return NextResponse.json({ message: 'Quiz updated' });
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json({ error: 'Failed to update quiz' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await runQuery('DELETE FROM quiz_questions WHERE quizId = ?', [params.id]);
    await runQuery('DELETE FROM quiz_answers WHERE quizId = ?', [params.id]);
    await runQuery('DELETE FROM quizzes WHERE id = ?', [params.id]);

    return NextResponse.json({ message: 'Quiz deleted' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json({ error: 'Failed to delete quiz' }, { status: 500 });
  }
}
