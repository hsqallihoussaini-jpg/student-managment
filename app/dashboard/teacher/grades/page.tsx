'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Enrollment {
  id: number;
  studentId: number;
  courseId: number;
  grade: string | null;
  enrollmentDate: string;
  firstName: string;
  lastName: string;
  courseName: string;
}

export default function TeacherGradesPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [grades, setGrades] = useState<{ [key: number]: string }>({});

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

        if (coursesData.length > 0) {
          setSelectedCourse(coursesData[0].id);

          // Get enrollments for first course
          const enrollmentsResponse = await fetch(`/api/courses/${coursesData[0].id}/enrollments`);
          if (enrollmentsResponse.ok) {
            const enrollmentsData = await enrollmentsResponse.json();
            setEnrollments(enrollmentsData);
            
            // Initialize grades
            const initialGrades: { [key: number]: string } = {};
            enrollmentsData.forEach((e: Enrollment) => {
              initialGrades[e.id] = e.grade || '';
            });
            setGrades(initialGrades);
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

  const handleCourseChange = async (courseId: number) => {
    setSelectedCourse(courseId);
    
    try {
      const enrollmentsResponse = await fetch(`/api/courses/${courseId}/enrollments`);
      if (enrollmentsResponse.ok) {
        const enrollmentsData = await enrollmentsResponse.json();
        setEnrollments(enrollmentsData);
        
        const initialGrades: { [key: number]: string } = {};
        enrollmentsData.forEach((e: Enrollment) => {
          initialGrades[e.id] = e.grade || '';
        });
        setGrades(initialGrades);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des inscriptions');
    }
  };

  const handleGradeChange = (enrollmentId: number, grade: string) => {
    setGrades(prev => ({
      ...prev,
      [enrollmentId]: grade,
    }));
  };

  const handleSaveGrades = async () => {
    if (!teacherId) return;

    try {
      for (const [enrollmentId, grade] of Object.entries(grades)) {
        const enrollment = enrollments.find(e => e.id === parseInt(enrollmentId));
        if (!enrollment) continue;

        await fetch('/api/teachers/grades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teacherId,
            studentId: enrollment.studentId,
            courseId: enrollment.courseId,
            grade: grade || null,
          }),
        });
      }

      setError('');
      // Refresh enrollments
      if (selectedCourse) {
        const enrollmentsResponse = await fetch(`/api/courses/${selectedCourse}/enrollments`);
        if (enrollmentsResponse.ok) {
          const enrollmentsData = await enrollmentsResponse.json();
          setEnrollments(enrollmentsData);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    }
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
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📝 Gérer les notes</h1>
        <p className="text-gray-600">Ajoutez et modifiez les notes de vos étudiants</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionnez un cours
        </label>
        <select
          value={selectedCourse || ''}
          onChange={(e) => handleCourseChange(parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
        >
          <option value="">Choisir un cours...</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>
              {course.name} ({course.code})
            </option>
          ))}
        </select>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded text-center text-blue-700">
          <p>Aucun étudiant inscrit à ce cours</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-rose-500 to-orange-500 text-white">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Étudiant</th>
                  <th className="px-6 py-3 text-left font-semibold">Note</th>
                  <th className="px-6 py-3 text-left font-semibold">Date d'inscription</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment, index) => (
                  <tr key={enrollment.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {enrollment.firstName} {enrollment.lastName}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        placeholder="A, B, C, D, F, etc."
                        value={grades[enrollment.id] || ''}
                        onChange={(e) => handleGradeChange(enrollment.id, e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 w-24"
                      />
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(enrollment.enrollmentDate).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleSaveGrades}
            className="mt-6 w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold py-3 rounded-lg hover:from-rose-600 hover:to-orange-600 transition"
          >
            💾 Enregistrer les notes
          </button>
        </>
      )}
    </div>
  );
}
