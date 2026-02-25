'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  id: number;
  senderId: number;
  senderRole: string;
  recipientId: number;
  recipientRole: string;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [session, setSession] = useState<any>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<string>('');
  const [showCompose, setShowCompose] = useState(false);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState({
    recipientId: '',
    subject: '',
    content: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get session
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = await sessionResponse.json();
        setSession(sessionData);

        if (!sessionData?.user?.email) {
          router.push('/login');
          return;
        }

        // Determine role and get userId
        const studentsResponse = await fetch('/api/students');
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          const studentsList = Array.isArray(studentsData) ? studentsData : [];
          const student = studentsList.find((s: any) => s.email === sessionData.user.email);

          const teachersResponse = await fetch('/api/teachers');
          if (teachersResponse.ok) {
            const teachersData = await teachersResponse.json();
            const teachersList = Array.isArray(teachersData) ? teachersData : [];
            const teacher = teachersList.find((t: any) => t.email === sessionData.user.email);

            if (student) {
              setRole('student');
              setUserId(student.id);
              setRecipients(teachersList);
              
              // Get messages
              const messagesResponse = await fetch(`/api/messages?recipientId=${student.id}&recipientRole=student`);
              if (messagesResponse.ok) {
                const messagesData = await messagesResponse.json();
                setMessages(Array.isArray(messagesData) ? messagesData : []);
              } else {
                setMessages([]);
              }
            } else if (teacher) {
              setRole('teacher');
              setUserId(teacher.id);
              setRecipients(studentsList);
              
              // Get messages
              const messagesResponse = await fetch(`/api/messages?recipientId=${teacher.id}&recipientRole=teacher`);
              if (messagesResponse.ok) {
                const messagesData = await messagesResponse.json();
                setMessages(Array.isArray(messagesData) ? messagesData : []);
              } else {
                setMessages([]);
              }
            } else {
              router.push('/login');
              return;
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !role) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: userId,
          senderRole: role,
          recipientId: parseInt(newMessage.recipientId),
          recipientRole: role === 'student' ? 'teacher' : 'student',
          subject: newMessage.subject,
          content: newMessage.content,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'envoi du message');
      }

      setNewMessage({ recipientId: '', subject: '', content: '' });
      setShowCompose(false);

      // Refresh messages
      const messagesResponse = await fetch(`/api/messages?recipientId=${userId}&recipientRole=${role}`);
      const messagesData = await messagesResponse.json();
      setMessages(messagesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
    }
  };

  const handleMarkAsRead = async (messageId: number) => {
    try {
      await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      });

      setMessages(messages.map(m => 
        m.id === messageId ? { ...m, isRead: true } : m
      ));
    } catch (err) {
      console.error('Erreur lors du marquage du message:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  const unreadMessages = messages.filter(m => !m.isRead).length;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">💬 Messages</h1>
          <p className="text-gray-600">Communiquez avec {role === 'student' ? 'les professeurs' : 'les étudiants'}</p>
        </div>
        <button
          onClick={() => setShowCompose(!showCompose)}
          className="px-6 py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-lg hover:from-rose-600 hover:to-orange-600 transition font-semibold"
        >
          ✏️ Nouveau message
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {showCompose && (
        <div className="mb-8 bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">Rédiger un message</h3>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destinataire
              </label>
              <select
                value={newMessage.recipientId}
                onChange={(e) => setNewMessage(prev => ({ ...prev, recipientId: e.target.value }))}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              >
                <option value="">Choisir un destinataire...</option>
                {recipients.map(recipient => (
                  <option key={recipient.id} value={recipient.id}>
                    {recipient.firstName} {recipient.lastName} {recipient.email && `(${recipient.email})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sujet
              </label>
              <input
                type="text"
                value={newMessage.subject}
                onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Sujet du message"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={newMessage.content}
                onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Écrivez votre message..."
                rows={5}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold py-2 rounded-lg hover:from-rose-600 hover:to-orange-600 transition"
              >
                📤 Envoyer
              </button>
              <button
                type="button"
                onClick={() => setShowCompose(false)}
                className="flex-1 bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-300 transition"
              >
                ❌ Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-6 flex gap-4">
        <span className="px-4 py-2 bg-rose-100 text-rose-700 rounded-full font-semibold">
          Total: {messages.length} messages
        </span>
        <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full font-semibold">
          Non lus: {unreadMessages}
        </span>
      </div>

      {messages.length === 0 ? (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded text-center text-blue-700">
          <p>Aucun message pour le moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              onClick={() => !message.isRead && handleMarkAsRead(message.id)}
              className={`rounded-lg shadow-md p-6 cursor-pointer transition ${
                message.isRead
                  ? 'bg-white border-l-4 border-gray-300'
                  : 'bg-rose-50 border-l-4 border-rose-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-lg font-bold text-gray-800">
                    {message.subject || '(Pas de sujet)'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {message.senderRole === 'student' ? 'Étudiant' : 'Professeur'}: {message.senderId}
                  </p>
                </div>
                {!message.isRead && (
                  <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Non lu
                  </span>
                )}
              </div>
              
              <p className="text-gray-700 whitespace-pre-wrap mb-3">{message.content}</p>
              
              <p className="text-xs text-gray-500">
                {new Date(message.createdAt).toLocaleDateString('fr-FR')} à{' '}
                {new Date(message.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
