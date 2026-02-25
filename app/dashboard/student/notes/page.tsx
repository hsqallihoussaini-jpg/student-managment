'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Note {
  id: number;
  studentId: number;
  courseId: number;
  title: string;
  content: string;
  courseName: string;
  courseCode: string;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: number;
  name: string;
  code: string;
}

export default function StudentNotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentId, setStudentId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get session and student info
        const sessionResponse = await fetch('/api/auth/session');
        const session = await sessionResponse.json();

        if (!session?.user?.email) {
          router.push('/login');
          return;
        }

        const studentsResponse = await fetch('/api/students');
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          const studentsList = Array.isArray(studentsData) ? studentsData : [];
          const student = studentsList.find((s: any) => s.email === session.user.email);

          if (!student) {
            router.push('/login');
            return;
          }

          setStudentId(student.id);

          // Get enrolled courses
          const coursesResponse = await fetch(`/api/students/${student.id}/courses`);
          if (coursesResponse.ok) {
            const coursesData = await coursesResponse.json();
            const coursesList = Array.isArray(coursesData) ? coursesData : [];
            setCourses(coursesList);
          }

          // Get notes
          const notesResponse = await fetch(`/api/students/notes?studentId=${student.id}`);
          if (notesResponse.ok) {
            const notesData = await notesResponse.json();
            setNotes(Array.isArray(notesData) ? notesData : []);
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

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !selectedCourse || !formData.title) return;

    try {
      if (editingNoteId) {
        // Update existing note
        const response = await fetch(`/api/students/notes/${editingNoteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            content: formData.content,
          }),
        });

        if (!response.ok) throw new Error('Erreur lors de la mise à jour');

        // Refresh notes
        const notesResponse = await fetch(`/api/students/notes?studentId=${studentId}`);
        if (notesResponse.ok) {
          const notesData = await notesResponse.json();
          setNotes(Array.isArray(notesData) ? notesData : []);
        }

        setEditingNoteId(null);
      } else {
        // Create new note
        const response = await fetch('/api/students/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            courseId: selectedCourse,
            title: formData.title,
            content: formData.content,
          }),
        });

        if (!response.ok) throw new Error('Erreur lors de la création');

        // Refresh notes
        const notesResponse = await fetch(`/api/students/notes?studentId=${studentId}`);
        if (notesResponse.ok) {
          const notesData = await notesResponse.json();
          setNotes(Array.isArray(notesData) ? notesData : []);
        }
      }

      setFormData({ title: '', content: '' });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) return;

    try {
      const response = await fetch(`/api/students/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      setNotes(notes.filter(n => n.id !== noteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setSelectedCourse(note.courseId);
    setFormData({
      title: note.title,
      content: note.content,
    });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📝 Mes Notes</h1>
        <p className="text-gray-600">Prenez des notes pour chaque matière</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => {
            setShowForm(true);
            setEditingNoteId(null);
            setFormData({ title: '', content: '' });
            setSelectedCourse(null);
          }}
          className="mb-6 px-6 py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold rounded-lg hover:from-rose-600 hover:to-orange-600 transition"
        >
          ➕ Ajouter une note
        </button>
      )}

      {showForm && (
        <div className="mb-8 bg-white rounded-lg shadow-lg p-6 border-l-4 border-rose-500">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">
            {editingNoteId ? '✏️ Modifier la note' : '📝 Nouvelle note'}
          </h3>
          <form onSubmit={handleAddNote} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matière *
              </label>
              <select
                value={selectedCourse || ''}
                onChange={(e) => setSelectedCourse(parseInt(e.target.value))}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              >
                <option value="">Sélectionnez une matière...</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre *
              </label>
              <input
                type="text"
                placeholder="Titre de la note"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenu
              </label>
              <textarea
                placeholder="Écrivez votre note..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold py-2 rounded-lg hover:from-rose-600 hover:to-orange-600 transition"
              >
                ✅ Enregistrer
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingNoteId(null);
                  setFormData({ title: '', content: '' });
                }}
                className="flex-1 bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-300 transition"
              >
                ❌ Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded text-center text-blue-700">
          <p>Aucune note pour le moment. Créez votre première note! 📝</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {notes.map(note => (
            <div key={note.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-rose-400 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{note.title}</h3>
                  <p className="text-sm text-gray-500">
                    {note.courseName} ({note.courseCode})
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditNote(note)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p className="text-gray-700 mb-3 whitespace-pre-wrap">{note.content}</p>
              <div className="text-xs text-gray-400">
                Modifié le {new Date(note.updatedAt).toLocaleDateString('fr-FR')} à{' '}
                {new Date(note.updatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
