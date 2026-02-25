'use client';

import { useState, useEffect } from 'react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  courseId: number;
  courseName: string;
  priority: string;
  createdAt: string;
}

export default function TeacherAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    courseId: '',
    priority: 'normal'
  });
  const [teacherInfo, setTeacherInfo] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const teacherResponse = await fetch('/api/teachers');
        const teacherData = await teacherResponse.json();
        if (Array.isArray(teacherData) && teacherData.length > 0) {
          setTeacherInfo(teacherData[0]);
        }

        const courseResponse = await fetch('/api/courses');
        const courseData = await courseResponse.json();
        setCourses(Array.isArray(courseData) ? courseData : []);

        const announcementResponse = await fetch('/api/announcements');
        const announcementData = await announcementResponse.json();
        setAnnouncements(Array.isArray(announcementData) ? announcementData.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ) : []);
      } catch (error) {
        console.error('Error initializing:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.courseId || !teacherInfo?.id) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      const url = editingId ? `/api/announcements/${editingId}` : '/api/announcements';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          courseId: parseInt(formData.courseId),
          teacherId: teacherInfo.id
        })
      });

      if (response.ok) {
        alert(editingId ? 'Annonce modifiée' : 'Annonce créée');
        setFormData({ title: '', content: '', courseId: '', priority: 'normal' });
        setShowForm(false);
        setEditingId(null);
        
        const announcementResponse = await fetch('/api/announcements');
        const announcementData = await announcementResponse.json();
        setAnnouncements(Array.isArray(announcementData) ? announcementData.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ) : []);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de l\'opération');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce?')) return;

    try {
      const response = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setAnnouncements(announcements.filter(a => a.id !== id));
        alert('Annonce supprimée');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      courseId: announcement.courseId.toString(),
      priority: announcement.priority
    });
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      default: return 'border-blue-500 bg-blue-50';
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800">📢 Gestion des Annonces</h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ title: '', content: '', courseId: '', priority: 'normal' });
            }}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition"
          >
            {showForm ? 'Annuler' : '+ Nouvelle Annonce'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-t-4 border-green-500">
            <h2 className="text-2xl font-semibold mb-6 text-slate-700">
              {editingId ? 'Modifier l\'annonce' : 'Créer une nouvelle annonce'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Titre de l'annonce"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-slate-300 rounded px-4 py-2 focus:outline-none focus:border-green-500"
                required
              />

              <textarea
                placeholder="Contenu de l'annonce"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full border border-slate-300 rounded px-4 py-2 focus:outline-none focus:border-green-500"
                rows={6}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="border border-slate-300 rounded px-4 py-2 focus:outline-none focus:border-green-500"
                  required
                >
                  <option value="">Sélectionner un cours</option>
                  {courses.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="border border-slate-300 rounded px-4 py-2 focus:outline-none focus:border-green-500"
                >
                  <option value="normal">🔵 Normal</option>
                  <option value="high">🟠 Important</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition font-semibold"
              >
                {editingId ? 'Modifier l\'annonce' : 'Créer l\'annonce'}
              </button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {announcements && announcements.length > 0 ? (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`rounded-lg shadow-md p-6 border-l-4 ${priorityColor(announcement.priority)} hover:shadow-lg transition`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-800">{announcement.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">📚 {announcement.courseName}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600 transition"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600 transition"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                <p className="text-slate-700 mb-3 whitespace-pre-wrap">{announcement.content}</p>
                <p className="text-xs text-slate-500">
                  📅 {new Date(announcement.createdAt).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
              <p className="text-lg">Aucune annonce. Commencez par en créer une!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
