'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Course {
  id: number;
  name: string;
  code: string;
  description: string;
  credits: number;
  semester: string;
  enrolledAt: string;
  isEnrolled: boolean;
}

export default function StudentProgramPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalCredits, setTotalCredits] = useState(0);

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

          // Get enrolled courses
          const coursesResponse = await fetch(`/api/students/${student.id}/courses`);
          if (coursesResponse.ok) {
            const coursesData = await coursesResponse.json();
            const coursesList = Array.isArray(coursesData) ? coursesData : [];
            setCourses(coursesList);
            
            // Calculate total credits
            const totalCreds = coursesList.reduce((sum: number, course: Course) => sum + (course.credits || 0), 0);
            setTotalCredits(totalCreds);
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
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 Mon Programme d'Études</h1>
        <p className="text-gray-600">Suivi de vos cours et de votre progression</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100 mb-2">Matières inscrites</p>
              <p className="text-4xl font-bold">{courses.length}</p>
            </div>
            <div className="text-5xl opacity-20">📚</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 mb-2">Crédits totaux</p>
              <p className="text-4xl font-bold">{totalCredits}</p>
            </div>
            <div className="text-5xl opacity-20">⭐</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 mb-2">Progression</p>
              <p className="text-4xl font-bold">{courses.length > 0 ? '100%' : '0%'}</p>
            </div>
            <div className="text-5xl opacity-20">✅</div>
          </div>
        </div>
      </div>

      {/* Courses List */}
      {courses.length === 0 ? (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded text-center text-blue-700">
          <p>Vous n'êtes inscrit à aucune matière. Allez à "Mes cours" pour vous inscrire! 📖</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-rose-500 to-orange-500 text-white">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Code</th>
                  <th className="px-6 py-3 text-left font-semibold">Matière</th>
                  <th className="px-6 py-3 text-left font-semibold">Description</th>
                  <th className="px-6 py-3 text-center font-semibold">Crédits</th>
                  <th className="px-6 py-3 text-left font-semibold">Semestre</th>
                  <th className="px-6 py-3 text-left font-semibold">Inscription</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, index) => (
                  <tr key={course.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} >
                    <td className="px-6 py-4">
                      <span className="inline-block bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {course.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{course.name}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <p className="max-w-xs">{course.description || 'Pas de description'}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded font-semibold">
                        {course.credits || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {course.semester || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(course.enrolledAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <p className="text-gray-700 font-semibold">Total</p>
              <p className="text-2xl font-bold text-orange-600">{courses.length} matière{courses.length > 1 ? 's' : ''} — {totalCredits} crédits</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/dashboard/student/notes"
          className="p-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg shadow-lg hover:shadow-xl transition text-center"
        >
          <div className="text-4xl mb-2">📝</div>
          <h3 className="font-bold text-lg mb-1">Mes Notes</h3>
          <p className="text-sm opacity-90">Prenez des notes pour vos matières</p>
        </a>

        <a
          href="/dashboard/student/schedule"
          className="p-6 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-lg shadow-lg hover:shadow-xl transition text-center"
        >
          <div className="text-4xl mb-2">⏰</div>
          <h3 className="font-bold text-lg mb-1">Emploi du Temps</h3>
          <p className="text-sm opacity-90">Organisez votre programme</p>
        </a>

        <a
          href="/dashboard/courses"
          className="p-6 bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-lg shadow-lg hover:shadow-xl transition text-center"
        >
          <div className="text-4xl mb-2">🎓</div>
          <h3 className="font-bold text-lg mb-1">Mes Cours</h3>
          <p className="text-sm opacity-90">Gérez vos inscriptions</p>
        </a>
      </div>
    </div>
  );
}
