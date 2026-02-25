import { NextRequest, NextResponse } from 'next/server';
import { allQuery, getQuery, runQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const quizId = searchParams.get('quizId');
    const studentId = searchParams.get('studentId');

    let sql = `
      SELECT qa.*, q.title as quizTitle, s.firstName, s.lastName
      FROM quiz_answers qa
      LEFT JOIN quizzes q ON qa.quizId = q.id
      LEFT JOIN students s ON qa.studentId = s.id
    `;
    let params: any[] = [];
    let conditions = [];

    if (quizId) {
      conditions.push('qa.quizId = ?');
      params.push(quizId);
    }

    if (studentId) {
      conditions.push('qa.studentId = ?');
      params.push(studentId);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY qa.submittedAt DESC';

    const answers = await allQuery(sql, params);
    return NextResponse.json(answers);
  } catch (error) {
    console.error('Error fetching quiz answers:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz answers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quizId, studentId, answers, isSubmitted, score } = body;

    if (!quizId || !studentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if student already has an answer for this quiz
    const existing = await getQuery(
      'SELECT id FROM quiz_answers WHERE quizId = ? AND studentId = ?',
      [quizId, studentId]
    );

    if (existing) {
      // Update existing
      await runQuery(
        `UPDATE quiz_answers SET answers = ?, isSubmitted = ?, score = ?, submittedAt = datetime('now')
         WHERE quizId = ? AND studentId = ?`,
        [JSON.stringify(answers || {}), isSubmitted ? 1 : 0, score || null, quizId, studentId]
      );
      return NextResponse.json({ message: 'Quiz answers updated' });
    } else {
      // Create new
      const result = await runQuery(
        `INSERT INTO quiz_answers (quizId, studentId, answers, isSubmitted, submittedAt)
         VALUES (?, ?, ?, ?, datetime('now'))`,
        [quizId, studentId, JSON.stringify(answers || {}), isSubmitted ? 1 : 0]
      );
      return NextResponse.json({ id: result.lastID, message: 'Quiz answers submitted' }, { status: 201 });
    }
  } catch (error) {
    console.error('Error saving quiz answers:', error);
    return NextResponse.json({ error: 'Failed to save quiz answers' }, { status: 500 });
  }
}
