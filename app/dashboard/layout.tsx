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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
      <nav className="bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold">🎓 Gestion des Étudiants</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">Bienvenue, {session?.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded transition backdrop-blur"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-white shadow-lg border-r-4 border-rose-200">
          <nav className="mt-4 space-y-2 px-2">
            <Link
              href="/dashboard"
              className="block px-4 py-3 text-gray-700 hover:bg-rose-50 border-l-4 border-transparent hover:border-rose-500 rounded-lg transition font-medium"
            >
              📊 Tableau de bord
            </Link>
            
            <div className="text-xs font-bold text-rose-600 uppercase px-4 py-2 mt-4">Étudiants</div>
            <Link
              href="/dashboard/students"
              className="block px-4 py-3 text-gray-700 hover:bg-rose-50 border-l-4 border-transparent hover:border-rose-500 rounded-lg transition"
            >
              👥 Liste des étudiants
            </Link>
            <Link
              href="/dashboard/add-student"
              className="block px-4 py-3 text-gray-700 hover:bg-orange-50 border-l-4 border-transparent hover:border-orange-500 rounded-lg transition"
            >
              ➕ Ajouter un étudiant
            </Link>

            <div className="text-xs font-bold text-orange-600 uppercase px-4 py-2 mt-4">Cours</div>
            <Link
              href="/dashboard/courses"
              className="block px-4 py-3 text-gray-700 hover:bg-rose-50 border-l-4 border-transparent hover:border-rose-500 rounded-lg transition"
            >
              📚 Liste des cours
            </Link>
            <Link
              href="/dashboard/add-course"
              className="block px-4 py-3 text-gray-700 hover:bg-orange-50 border-l-4 border-transparent hover:border-orange-500 rounded-lg transition"
            >
              ➕ Ajouter un cours
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
