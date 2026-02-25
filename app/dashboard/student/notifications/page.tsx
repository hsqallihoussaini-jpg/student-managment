'use client';

import { useState, useEffect } from 'react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  courseId?: number;
  actionUrl?: string;
  createdAt?: string;
  courseName?: string;
}

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true })
      });

      if (res.ok) {
        setNotifications(notifications.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        ));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return '📘';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'assignment': return '📋';
      case 'quiz': return '🎯';
      case 'material': return '📚';
      case 'grade': return '📊';
      case 'attendance': return '📍';
      default: return '🔔';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'border-l-blue-500 bg-blue-50';
      case 'success': return 'border-l-green-500 bg-green-50';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50';
      case 'error': return 'border-l-red-500 bg-red-50';
      case 'assignment': return 'border-l-purple-500 bg-purple-50';
      case 'quiz': return 'border-l-indigo-500 bg-indigo-50';
      case 'material': return 'border-l-blue-500 bg-blue-50';
      case 'grade': return 'border-l-pink-500 bg-pink-50';
      case 'attendance': return 'border-l-orange-500 bg-orange-50';
      default: return 'border-l-slate-500 bg-slate-50';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'info': return 'Information';
      case 'success': return 'Succès';
      case 'warning': return 'Avertissement';
      case 'error': return 'Erreur';
      case 'assignment': return 'Devoir';
      case 'quiz': return 'Quiz';
      case 'material': return 'Matériel';
      case 'grade': return 'Note';
      case 'attendance': return 'Présence';
      default: return 'Notification';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.isRead) return false;
    if (filter === 'read' && !n.isRead) return false;
    if (selectedType !== 'all' && n.type !== selectedType) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const types = [...new Set(notifications.map(n => n.type))];

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-slate-800">🔔 Notifications</h1>
          {unreadCount > 0 && (
            <div className="bg-rose-500 text-white rounded-full px-4 py-2 font-semibold">
              {unreadCount} non lues
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-slate-700">Filtres</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-2">État de lecture:</p>
              <div className="flex gap-2 flex-wrap">
                {['all', 'unread', 'read'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-4 py-2 rounded font-semibold transition ${
                      filter === f
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {f === 'all' ? 'Toutes' : f === 'unread' ? 'Non lues' : 'Lues'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-600 mb-2">Type:</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`px-4 py-2 rounded font-semibold transition ${
                    selectedType === 'all'
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Tous
                </button>
                {types.sort().map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded font-semibold transition text-sm ${
                      selectedType === type
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {getTypeIcon(type)} {getTypeLabel(type)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications
              .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
              .map(notification => (
                <div
                  key={notification.id}
                  className={`rounded-lg shadow-lg border-l-4 p-6 transition ${getTypeColor(notification.type)} ${
                    notification.isRead ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">{notification.title}</h3>
                          <p className="text-xs text-slate-500">
                            {getTypeLabel(notification.type)}
                            {notification.courseName && ` • ${notification.courseName}`}
                          </p>
                        </div>
                      </div>
                      <p className="text-slate-700 mb-3">{notification.message}</p>
                      <p className="text-xs text-slate-500">
                        {notification.createdAt && new Date(notification.createdAt).toLocaleString('fr-FR')}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600 transition text-sm font-semibold whitespace-nowrap"
                        >
                          Marquer comme lue
                        </button>
                      )}
                      {notification.isRead && (
                        <span className="text-xs text-slate-500 font-semibold text-center py-2">✓ Lu</span>
                      )}
                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition text-sm font-semibold"
                        >
                          Voir plus
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <p className="text-xl text-slate-500 mb-2">🎉 Pas de notifications</p>
              <p className="text-slate-400">Vous êtes à jour!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
