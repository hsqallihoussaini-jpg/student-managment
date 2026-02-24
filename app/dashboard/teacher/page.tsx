'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Stats {
  totalCourses: number;
  totalStudents: number;
  unreadMessages: number;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ totalCourses: 0, totalStudents: 0, unreadMessages: 0 });
  const [loading, setLoading] = useState(true);
  const [teacherId, setTeacherId] = useState<number | null>(null);

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
        let coursesCount = 0;
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          coursesCount = coursesData.length;
        }

        // Get unread messages
        const messagesResponse = await fetch(`/api/messages?recipientId=${teacher.id}&recipientRole=teacher`);
        let unreadCount = 0;
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          unreadCount = messagesData.filter((m: any) => !m.isRead).length;
        }

        setStats({
          totalCourses: coursesCount,
          totalStudents: 0,
          unreadMessages: unreadCount,
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
        <h1 className="text-4xl font-bold text-gray-800 mb-2">👨‍🏫 Tableau de bord Professeur</h1>
        <p className="text-gray-600">Bienvenue dans votre espace de gestion pédagogique</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Mes cours</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalCourses}</p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Messages non lus</p>
              <p className="text-3xl font-bold text-gray-800">{stats.unreadMessages}</p>
            </div>
            <div className="text-4xl">💬</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-pink-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Outils</p>
              <p className="text-3xl font-bold text-green-600">5</p>
            </div>
            <div className="text-4xl">🛠️</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/dashboard/teacher/courses"
          className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg shadow-lg p-8 text-white hover:shadow-xl transition transform hover:scale-105"
        >
          <div className="text-5xl mb-4">📖</div>
          <h3 className="text-2xl font-bold mb-2">Gérer mes cours</h3>
          <p className="text-rose-100">Créer, modifier et supprimer vos cours</p>
        </Link>

        <Link
          href="/dashboard/teacher/grades"
          className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow-lg p-8 text-white hover:shadow-xl transition transform hover:scale-105"
        >
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-2xl font-bold mb-2">Gérer les notes</h3>
          <p className="text-orange-100">Ajouter et modifier les notes des étudiants</p>
        </Link>

        <Link
          href="/dashboard/teacher/messages"
          className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-lg p-8 text-white hover:shadow-xl transition transform hover:scale-105"
        >
          <div className="text-5xl mb-4">💬</div>
          <h3 className="text-2xl font-bold mb-2">Messages</h3>
          <p className="text-blue-100">Communiquer avec vos étudiants</p>
        </Link>

        <Link
          href="/dashboard/teacher/notes-students"
          className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg p-8 text-white hover:shadow-xl transition transform hover:scale-105"
        >
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-2xl font-bold mb-2">Notes sur étudiants</h3>
          <p className="text-purple-100">Écrire des notes personnelles sur vos élèves</p>
        </Link>
      </div>
    </div>
  );
}
