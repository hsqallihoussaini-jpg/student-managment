import { NextRequest, NextResponse } from 'next/server';
import { allQuery, getQuery, runQuery } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return null;
  }
  return session;
}

export async function GET(request: NextRequest) {
  try {
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const recipientId = searchParams.get('recipientId');
    const recipientRole = searchParams.get('recipientRole');

    if (!recipientId || !recipientRole) {
      return NextResponse.json(
        { error: 'recipientId and recipientRole are required' },
        { status: 400 }
      );
    }

    const messages = await allQuery(
      `SELECT * FROM messages 
       WHERE (recipientId = ? AND recipientRole = ?) OR (senderId = ? AND senderRole = ?)
       ORDER BY createdAt DESC`,
      [parseInt(recipientId), recipientRole, parseInt(recipientId), recipientRole]
    );

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Error fetching messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { senderId, senderRole, recipientId, recipientRole, subject, content } = data;

    if (!senderId || !senderRole || !recipientId || !recipientRole || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await runQuery(
      `INSERT INTO messages (senderId, senderRole, recipientId, recipientRole, subject, content) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [senderId, senderRole, recipientId, recipientRole, subject || null, content]
    );

    return NextResponse.json(
      { message: 'Message sent successfully', messageId: result.lastID },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Error sending message' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { messageId } = data;

    if (!messageId) {
      return NextResponse.json(
        { error: 'messageId is required' },
        { status: 400 }
      );
    }

    await runQuery(
      'UPDATE messages SET isRead = 1 WHERE id = ?',
      [messageId]
    );

    return NextResponse.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Error updating message' },
      { status: 500 }
    );
  }
}
