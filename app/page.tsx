'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-4">Gestion des Étudiants</h1>
        <p className="text-xl mb-8">Système complet de gestion des étudiants et des cours</p>
        
        {status === 'unauthenticated' ? (
          <Link
            href="/login"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded font-bold hover:bg-gray-100 transition"
          >
            Se connecter
          </Link>
        ) : (
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded font-bold hover:bg-gray-100 transition"
          >
            Déconnexion
          </button>
        )}
      </div>
    </div>
  );
}
