'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalCourses: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, coursesRes] = await Promise.all([
          fetch('/api/students'),
          fetch('/api/courses'),
        ]);

        const students = await studentsRes.json();
        const courses = await coursesRes.json();

        setStats({
          totalStudents: students.length,
          activeStudents: students.filter((s: any) => s.status === 'active').length,
          totalCourses: courses.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Tableau de bord
          </h1>
          <p className="text-gray-600">Bienvenue, {session?.user?.email || 'Utilisateur'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Students */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-blue-500 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-gray-600 text-sm font-semibold mb-2">Total des étudiants</h2>
                <p className="text-4xl font-bold text-blue-600">{stats.totalStudents}</p>
              </div>
              <svg className="w-16 h-16 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v2h8v-2zM2 15a4 4 0 008 0v2H2v-2z"></path>
              </svg>
            </div>
          </div>

          {/* Active Students */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-green-500 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-gray-600 text-sm font-semibold mb-2">Étudiants actifs</h2>
                <p className="text-4xl font-bold text-green-600">{stats.activeStudents}</p>
              </div>
              <svg className="w-16 h-16 text-green-200" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999a11.954 11.954 0 010 10.002 8 8 0 107.07-7.07.75.75 0 10-1.06 1.06 6.5 6.5 0 11-9.142-9.142.75.75 0 00-1.06 1.06A11.954 11.954 0 012.166 4.999z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>

          {/* Total Courses */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-purple-500 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-gray-600 text-sm font-semibold mb-2">Total des cours</h2>
                <p className="text-4xl font-bold text-purple-600">{stats.totalCourses}</p>
              </div>
              <svg className="w-16 h-16 text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.5 1.5H5.75A2.25 2.25 0 003.5 3.75v12.5A2.25 2.25 0 005.75 18.5h8.5a2.25 2.25 0 002.25-2.25V6.5m-11-5v3.75m0 0h3.75m-3.75 0L10.5 6.5"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl shadow-lg p-8 border border-purple-200/50">
          <div className="flex items-start gap-4">
            <svg className="w-12 h-12 text-purple-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0zM8 9a1 1 0 100-2 1 1 0 000 2zm5-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd"></path>
            </svg>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Bienvenue dans votre tableau de bord</h2>
              <p className="text-gray-600">
                Utilisez le menu de navigation pour gérer les étudiants et les cours. Vous pouvez ajouter, modifier ou supprimer des enregistrements facilement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
