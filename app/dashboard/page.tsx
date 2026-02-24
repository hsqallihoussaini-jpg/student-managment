'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

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

        // If neither student nor teacher, show admin dashboard
        router.push('/dashboard/admin');
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };

    checkUserRole();
  }, [session, status, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium">Redirection en cours...</p>
      </div>
    </div>
  );
}
