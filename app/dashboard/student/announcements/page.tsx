'use client';

import { useState, useEffect } from 'react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  courseId: number;
  courseName: string;
  priority: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/api/announcements');
        if (response.ok) {
          const data = await response.json();
          setAnnouncements(Array.isArray(data) ? data.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ) : []);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const filteredAnnouncements = filter === 'all' 
    ? announcements 
    : announcements.filter(a => a.priority === filter);

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      default: return 'border-blue-500 bg-blue-50';
    }
  };

  const priorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return <span className="bg-red-500 text-white px-3 py-1 rounded text-sm">🔴 Urgent</span>;
      case 'high': return <span className="bg-orange-500 text-white px-3 py-1 rounded text-sm">🟠 Important</span>;
      default: return <span className="bg-blue-500 text-white px-3 py-1 rounded text-sm">🔵 Normal</span>;
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Chargement des annonces...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-800 mb-6">📢 Annonces Officielles</h1>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded transition ${
              filter === 'all' ? 'bg-blue-500 text-white' : 'bg-white border border-slate-300'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-4 py-2 rounded transition ${
              filter === 'urgent' ? 'bg-red-500 text-white' : 'bg-white border border-slate-300'
            }`}
          >
            🔴 Urgent
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`px-4 py-2 rounded transition ${
              filter === 'high' ? 'bg-orange-500 text-white' : 'bg-white border border-slate-300'
            }`}
          >
            🟠 Important
          </button>
          <button
            onClick={() => setFilter('normal')}
            className={`px-4 py-2 rounded transition ${
              filter === 'normal' ? 'bg-blue-500 text-white' : 'bg-white border border-slate-300'
            }`}
          >
            🔵 Normal
          </button>
        </div>

        <div className="space-y-4">
          {filteredAnnouncements && filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className={`rounded-lg shadow-md p-6 border-l-4 ${priorityColor(announcement.priority)} hover:shadow-lg transition`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800">{announcement.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Dr {announcement.firstName} {announcement.lastName} • {announcement.courseName}
                    </p>
                  </div>
                  {priorityBadge(announcement.priority)}
                </div>

                <p className="text-slate-700 mb-3 whitespace-pre-wrap">{announcement.content}</p>

                <div className="text-sm text-slate-500 flex justify-between items-center">
                  <span>📅 {new Date(announcement.createdAt).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
              <p className="text-lg">Aucune annonce pour le moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
