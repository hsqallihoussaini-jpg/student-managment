import { NextRequest, NextResponse } from 'next/server';
import { allQuery, runQuery } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quizId, questionText, questionType, options, correctAnswer, points } = body;

    if (!quizId || !questionText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await runQuery(
      `INSERT INTO quiz_questions (quizId, questionText, questionType, options, correctAnswer, points)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [quizId, questionText, questionType || 'mcq', JSON.stringify(options || []), correctAnswer || '', points || 1]
    );

    return NextResponse.json({ id: result.lastID, message: 'Question created' }, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const quizId = searchParams.get('quizId');

    if (!quizId) {
      return NextResponse.json({ error: 'quizId required' }, { status: 400 });
    }

    const questions = await allQuery(
      `SELECT * FROM quiz_questions WHERE quizId = ? ORDER BY id`,
      [quizId]
    );

    const parsedQuestions = questions.map((q: any) => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : []
    }));

    return NextResponse.json(parsedQuestions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}
