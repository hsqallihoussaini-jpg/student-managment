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
}

interface StudentCourse extends Course {
  enrolledAt: string;
  isEnrolled: boolean;
}

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'enrolled' | 'available'>('enrolled');
  const [studentId, setStudentId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get student info from session
        const sessionResponse = await fetch('/api/auth/session');
        const session = await sessionResponse.json();
        
        if (!session?.user?.email) {
          throw new Error('Authentification nécessaire');
        }

        // Get student ID
        const studentsResponse = await fetch('/api/students');
        const studentsData = await studentsResponse.json();
        const student = studentsData.find((s: any) => s.email === session.user.email);
        
        if (!student) {
          throw new Error('Étudiant non trouvé');
        }

        setStudentId(student.id);

        // Get all courses
        const coursesResponse = await fetch('/api/courses');
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          const coursesList = Array.isArray(coursesData) ? coursesData : [];
          setAllCourses(coursesList);

          // Get student's enrolled courses
          const enrolledResponse = await fetch(`/api/students/${student.id}/courses`);
          if (enrolledResponse.ok) {
            const enrolledData = await enrolledResponse.json();
            const enrolledList = Array.isArray(enrolledData) ? enrolledData : [];
            
            const enrolledCourses = coursesList.map((course: Course) => ({
              ...course,
              isEnrolled: enrolledList.some((ec: any) => ec.id === course.id),
              enrolledAt: enrolledList.find((ec: any) => ec.id === course.id)?.enrolledAt || '',
            }));

            setCourses(enrolledCourses);
          } else {
            setCourses(coursesList.map(c => ({ ...c, isEnrolled: false, enrolledAt: '' })));
          }
        } else {
          setAllCourses([]);
          setCourses([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des cours');
        setAllCourses([]);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEnroll = async (courseId: number) => {
    if (!studentId) return;

    try {
      const response = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, courseId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      setCourses(courses.map(c => 
        c.id === courseId ? { ...c, isEnrolled: true } : c
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
    }
  };

  const handleDropCourse = async (courseId: number) => {
    if (!studentId) return;

    if (!confirm('Êtes-vous sûr de vouloir vous désinscrire de ce cours ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}/drop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la désinscription');
      }

      setCourses(courses.map(c => 
        c.id === courseId ? { ...c, isEnrolled: false } : c
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la désinscription');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Chargement des cours...</p>
        </div>
      </div>
    );
  }

  const enrolledCourses = courses.filter(c => c.isEnrolled);
  const availableCourses = courses.filter(c => !c.isEnrolled);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 Gestion des cours</h1>
        <p className="text-gray-600">Consultez, inscrivez-vous ou désinscrivez-vous des cours</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab('enrolled')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            tab === 'enrolled'
              ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          ✅ Mes cours ({enrolledCourses.length})
        </button>
        <button
          onClick={() => setTab('available')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            tab === 'available'
              ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          🆕 Cours disponibles ({availableCourses.length})
        </button>
        <Link
          href="/dashboard/add-course"
          className="ml-auto px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transition"
        >
          ➕ Nouveau cours
        </Link>
      </div>

      {tab === 'enrolled' && (
        <div className="space-y-4">
          {enrolledCourses.length === 0 ? (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded text-center text-blue-700">
              <p className="text-lg">Vous n'êtes inscrit à aucun cours pour le moment</p>
              <p className="text-sm mt-2">Consultez les cours disponibles pour vous inscrire</p>
            </div>
          ) : (
            enrolledCourses.map(course => (
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
                  <button
                    onClick={() => handleDropCourse(course.id)}
                    className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold whitespace-nowrap"
                  >
                    ❌ Se désinscrire
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'available' && (
        <div className="space-y-4">
          {availableCourses.length === 0 ? (
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded text-center text-green-700">
              <p className="text-lg">Vous êtes inscrit à tous les cours disponibles !</p>
            </div>
          ) : (
            availableCourses.map(course => (
              <div
                key={course.id}
                className="bg-white border-l-4 border-orange-500 rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📚</span>
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
                  <button
                    onClick={() => handleEnroll(course.id)}
                    className="ml-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold whitespace-nowrap"
                  >
                    ✅ S'inscrire
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
