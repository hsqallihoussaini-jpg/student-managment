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
    <div>
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-600 text-sm font-semibold mb-2">Total des étudiants</h2>
          <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-600 text-sm font-semibold mb-2">Étudiants actifs</h2>
          <p className="text-3xl font-bold text-green-600">{stats.activeStudents}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-600 text-sm font-semibold mb-2">Total des cours</h2>
          <p className="text-3xl font-bold text-purple-600">{stats.totalCourses}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Bienvenue</h2>
        <p className="text-gray-600">
          Utilisez le menu de navigation pour gérer les étudiants et les cours.
        </p>
      </div>
    </div>
  );
}
