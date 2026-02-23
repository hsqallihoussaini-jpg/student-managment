'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold">Gestion des Étudiants</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">Bienvenue, {session?.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-white shadow-lg">
          <nav className="mt-4">
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 border-l-4 border-transparent hover:border-blue-500"
            >
              📊 Tableau de bord
            </Link>
            <Link
              href="/dashboard/students"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 border-l-4 border-transparent hover:border-blue-500"
            >
              👥 Étudiants
            </Link>
            <Link
              href="/dashboard/add-student"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 border-l-4 border-transparent hover:border-blue-500"
            >
              ➕ Ajouter un étudiant
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
