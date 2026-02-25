'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user?.email) {
      return;
    }

    // Check user role and redirect accordingly
    const checkUserRole = async () => {
      try {
        // Check if user is a student
        const studentsResponse = await fetch('/api/students');
        const studentsData = await studentsResponse.json();
        const student = studentsData.find((s: any) => s.email === session.user.email);

        if (student) {
          router.push('/dashboard/student');
          return;
        }

        // Check if user is a teacher
        const teachersResponse = await fetch('/api/teachers');
        const teachersData = await teachersResponse.json();
        const teacher = teachersData.find((t: any) => t.email === session.user.email);

        if (teacher) {
          router.push('/dashboard/teacher');
          return;
        }

        // If neither student nor teacher, show error
        setError('Votre profil utilisateur n\'a pu être déterminé. Veuillez contacter l\'administrateur.');
      } catch (error) {
        console.error('Error checking user role:', error);
        setError('Une erreur s\'est produite lors de la détermination de votre profil.');
      }
    };

    checkUserRole();
  }, [session, status, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <p className="text-red-600 font-medium text-lg mb-4">⚠️ Erreur</p>
          <p className="text-gray-700 mb-6">{error}</p>
          <a href="/login" className="text-rose-500 hover:text-rose-700 font-medium">Retour au login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium">Redirection en cours...</p>
      </div>
    </div>
  );
}
