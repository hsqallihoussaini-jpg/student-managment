'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Assignment {
  id: number;
  title: string;
  description: string;
  courseId: number;
  courseName: string;
  dueDate: string;
  maxScore: number;
  createdAt: string;
}

export default function TeacherAssignmentsPage() {
  const { data: session } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
    maxScore: 20
  });
  const [teacherInfo, setTeacherInfo] = useState<any>(null);

  useEffect(() => {
    const fetchTeacherInfo = async () => {
      try {
        const response = await fetch('/api/teachers');
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setTeacherInfo(data[0]);
        }
      } catch (error) {
        console.error('Error fetching teacher info:', error);
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (response.ok) {
          const data = await response.json();
          setCourses(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    const fetchAssignments = async () => {
      try {
        const response = await fetch('/api/assignments');
        if (response.ok) {
          const data = await response.json();
          setAssignments(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherInfo();
    fetchCourses();
    fetchAssignments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.courseId || !formData.dueDate || !teacherInfo?.id) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          courseId: parseInt(formData.courseId),
          teacherId: teacherInfo.id,
          maxScore: parseInt(formData.maxScore.toString())
        })
      });

      if (response.ok) {
        alert('Devoir créé avec succès');
        setFormData({ title: '', description: '', courseId: '', dueDate: '', maxScore: 20 });
        setShowForm(false);
        // Refresh assignments
        const listResponse = await fetch('/api/assignments');
        if (listResponse.ok) {
          const data = await listResponse.json();
          setAssignments(Array.isArray(data) ? data : []);
        }
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Erreur lors de la création du devoir');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce devoir?')) return;

    try {
      const response = await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setAssignments(assignments.filter(a => a.id !== id));
        alert('Devoir supprimé');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800">📝 Gestion des Devoirs</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition"
          >
            {showForm ? 'Annuler' : '+ Nouveau Devoir'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-t-4 border-blue-500">
            <h2 className="text-2xl font-semibold mb-6 text-slate-700">Créer un nouveau devoir</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Titre du devoir"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border border-slate-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                  required
                />
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="border border-slate-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Sélectionner un cours</option>
                  {courses.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-slate-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                rows={4}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="border border-slate-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Score maximum"
                  value={formData.maxScore}
                  onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) })}
                  className="border border-slate-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition font-semibold"
              >
                Créer le devoir
              </button>
            </form>
          </div>
        )}

        <div className="grid gap-6">
          {assignments && assignments.length > 0 ? (
            assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">{assignment.title}</h3>
                    <p className="text-slate-600 mb-3">{assignment.description}</p>
                    <div className="flex gap-4 text-sm text-slate-500">
                      <span>📚 {assignment.courseName}</span>
                      <span>📅 Dû: {new Date(assignment.dueDate).toLocaleDateString('fr-FR')}</span>
                      <span>⭐ {assignment.maxScore} points</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/teacher/assignments/${assignment.id}`}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    >
                      Voir réponses
                    </Link>
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
              <p className="text-lg">Aucun devoir créé. Commencez par en créer un!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
