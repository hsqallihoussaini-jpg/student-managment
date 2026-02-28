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

    if (!session?.user) {
      router.push('/login');
      return;
    }

    // Use role from JWT session directly - no API calls needed
    const role = (session.user as any).role;

    if (role === 'student') {
      router.push('/dashboard/student');
    } else if (role === 'teacher') {
      router.push('/dashboard/teacher');
    } else {
      setError('Votre profil utilisateur n\'a pu être déterminé. Veuillez contacter l\'administrateur.');
    }
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
