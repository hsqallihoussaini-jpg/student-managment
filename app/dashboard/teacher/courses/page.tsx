'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Course {
  id: number;
  code: string;
  name: string;
  description: string;
  credits: number;
  semester: string;
  teacherId: number;
}

export default function TeacherCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    credits: '',
    semester: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get session and teacher info
        const sessionResponse = await fetch('/api/auth/session');
        const session = await sessionResponse.json();
        
        if (!session?.user?.email) {
          router.push('/login');
          return;
        }

        const teachersResponse = await fetch('/api/teachers');
        const teachersData = await teachersResponse.json();
        const teacher = teachersData.find((t: any) => t.email === session.user.email);
        
        if (!teacher) {
          router.push('/login');
          return;
        }

        setTeacherId(teacher.id);

        // Get teacher's courses
        const coursesResponse = await fetch(`/api/teachers/${teacher.id}/courses`);
        const coursesData = await coursesResponse.json();
        setCourses(coursesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des cours');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId) return;

    try {
      const response = await fetch(`/api/teachers/${teacherId}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code,
          name: formData.name,
          description: formData.description,
          credits: parseInt(formData.credits),
          semester: formData.semester,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la création du cours');
      }

      // Refresh courses
      const coursesResponse = await fetch(`/api/teachers/${teacherId}/courses`);
      const coursesData = await coursesResponse.json();
      setCourses(coursesData);

      setFormData({ code: '', name: '', description: '', credits: '', semester: '' });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du cours');
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!teacherId) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/teachers/${teacherId}/courses?courseId=${courseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la suppression du cours');
      }

      setCourses(courses.filter(c => c.id !== courseId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du cours');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Chargement de vos cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 Mes cours</h1>
          <p className="text-gray-600">Gestion de vos cours et étudiants inscrits</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-lg hover:from-rose-600 hover:to-orange-600 transition font-semibold"
        >
          ➕ Ajouter un cours
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-8 bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">Créer un nouveau cours</h3>
          <form onSubmit={handleAddCourse} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="code"
                placeholder="Code du cours (ex: CS101)"
                value={formData.code}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              />
              <input
                type="text"
                name="name"
                placeholder="Nom du cours"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              />
            </div>

            <textarea
              name="description"
              placeholder="Description du cours..."
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                name="credits"
                placeholder="Crédits"
                value={formData.credits}
                onChange={handleInputChange}
                min="1"
                max="6"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              />
              <select
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              >
                <option value="">Sélectionnez un semestre</option>
                <option value="Fall 2024">Automne 2024</option>
                <option value="Spring 2025">Printemps 2025</option>
                <option value="Summer 2025">Été 2025</option>
                <option value="Fall 2025">Automne 2025</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold py-2 rounded-lg hover:from-rose-600 hover:to-orange-600 transition"
              >
                ✅ Créer
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-300 transition"
              >
                ❌ Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded text-center text-blue-700">
          <p className="text-lg">Vous n'avez pas encore créé de cours</p>
          <p className="text-sm mt-2">Cliquez sur le bouton "Ajouter un cours" pour créer votre premier cours</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map(course => (
            <div
              key={course.id}
              className="bg-white border-l-4 border-rose-500 rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📖</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{course.name}</h3>
                      <p className="text-sm text-gray-600">{course.code}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mt-2">{course.description}</p>
                  <div className="mt-3 flex gap-4 text-sm">
                    <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full">
                      {course.credits} crédits
                    </span>
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                      {course.semester}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  <Link
                    href={`/dashboard/teacher/courses/${course.id}/students`}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold whitespace-nowrap text-center"
                  >
                    👥 Étudiants
                  </Link>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                  >
                    ❌ Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
