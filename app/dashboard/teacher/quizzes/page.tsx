'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Quiz {
  id: number;
  title: string;
  description: string;
  courseId: number;
  courseName: string;
  dueDate: string;
  totalPoints: number;
  timeLimit: number;
}

export default function TeacherQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
    timeLimit: 60,
    totalPoints: 20
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

        const quizResponse = await fetch('/api/quizzes');
        const quizData = await quizResponse.json();
        setQuizzes(Array.isArray(quizData) ? quizData : []);
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
    
    if (!formData.title || !formData.courseId || !formData.dueDate || !teacherInfo?.id) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          courseId: parseInt(formData.courseId),
          teacherId: teacherInfo.id,
          timeLimit: parseInt(formData.timeLimit.toString()),
          totalPoints: parseInt(formData.totalPoints.toString())
        })
      });

      if (response.ok) {
        const newQuiz = await response.json();
        alert('QCM créé! Vous pouvez maintenant ajouter des questions.');
        setFormData({ title: '', description: '', courseId: '', dueDate: '', timeLimit: 60, totalPoints: 20 });
        setShowForm(false);
        
        const quizResponse = await fetch('/api/quizzes');
        const quizData = await quizResponse.json();
        setQuizzes(Array.isArray(quizData) ? quizData : []);
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Erreur lors de la création du QCM');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce QCM?')) return;

    try {
      const response = await fetch(`/api/quizzes/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setQuizzes(quizzes.filter(q => q.id !== id));
        alert('QCM supprimé');
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800">🎯 Gestion des QCM/Tests</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition"
          >
            {showForm ? 'Annuler' : '+ Nouveau QCM'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-t-4 border-blue-500">
            <h2 className="text-2xl font-semibold mb-6 text-slate-700">Créer un nouveau QCM</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Titre du QCM"
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
                rows={3}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="border border-slate-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Durée (minutes)"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                  className="border border-slate-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Points totaux"
                  value={formData.totalPoints}
                  onChange={(e) => setFormData({ ...formData, totalPoints: parseInt(e.target.value) })}
                  className="border border-slate-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition font-semibold"
              >
                Créer le QCM
              </button>
            </form>
          </div>
        )}

        <div className="grid gap-6">
          {quizzes && quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">{quiz.title}</h3>
                    <p className="text-slate-600 mb-3">{quiz.description}</p>
                    <div className="flex gap-4 text-sm text-slate-500">
                      <span>📚 {quiz.courseName}</span>
                      <span>📅 Dû: {new Date(quiz.dueDate).toLocaleDateString('fr-FR')}</span>
                      <span>⏱️ {quiz.timeLimit} min</span>
                      <span>⭐ {quiz.totalPoints} points</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/teacher/quizzes/${quiz.id}`}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    >
                      Gérer
                    </Link>
                    <button
                      onClick={() => handleDelete(quiz.id)}
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
              <p className="text-lg">Aucun QCM créé. Commencez par en créer un!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
