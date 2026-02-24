'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Stats {
  totalCourses: number;
  activeCourses: number;
  averageGrade: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ totalCourses: 0, activeCourses: 0, averageGrade: 'N/A' });
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<number | null>(null);

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
        const studentsData = await studentsResponse.json();
        const student = studentsData.find((s: any) => s.email === session.user.email);
        
        if (!student) {
          router.push('/login');
          return;
        }

        setStudentId(student.id);

        // Get enrolled courses
        const coursesResponse = await fetch(`/api/students/${student.id}/courses`);
        const coursesData = await coursesResponse.json();

        setStats({
          totalCourses: coursesData.length,
          activeCourses: coursesData.length,
          averageGrade: 'À calculer',
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
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
          <p className="text-gray-700 font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">👨‍🎓 Tableau de bord Étudiant</h1>
        <p className="text-gray-600">Bienvenue dans votre espace de gestion des cours</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Cours inscrits</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalCourses}</p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Cours actifs</p>
              <p className="text-3xl font-bold text-gray-800">{stats.activeCourses}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-pink-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">État</p>
              <p className="text-3xl font-bold text-green-600">Actif</p>
            </div>
            <div className="text-4xl">🎓</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/dashboard/courses"
          className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg shadow-lg p-8 text-white hover:shadow-xl transition transform hover:scale-105"
        >
          <div className="text-5xl mb-4">📖</div>
          <h3 className="text-2xl font-bold mb-2">Gérer mes cours</h3>
          <p className="text-rose-100">S'inscrire à des cours et se désinscrire</p>
        </Link>

        <Link
          href="/dashboard/messages"
          className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow-lg p-8 text-white hover:shadow-xl transition transform hover:scale-105"
        >
          <div className="text-5xl mb-4">💬</div>
          <h3 className="text-2xl font-bold mb-2">Messages</h3>
          <p className="text-orange-100">Communiquer avec les professeurs</p>
        </Link>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-lg p-8 text-white">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-2xl font-bold mb-2">Mes notes</h3>
          <p className="text-blue-100">Consulter vos notes et résultats</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg p-8 text-white">
          <div className="text-5xl mb-4">👤</div>
          <h3 className="text-2xl font-bold mb-2">Mon Profil</h3>
          <p className="text-purple-100">Gérer vos informations personnelles</p>
        </div>
      </div>
    </div>
  );
}
