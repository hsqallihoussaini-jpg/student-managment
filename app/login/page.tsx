'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-2xl mx-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 border border-white/30">
          <div className="mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 bg-clip-text text-transparent text-center mb-2">
              Gestion des Étudiants
            </h1>
            <p className="text-center text-gray-600 text-lg font-medium">Sélectionnez votre rôle pour continuer</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Student Option */}
            <div
              onClick={() => router.push('/login/student')}
              className="group cursor-pointer p-8 border-2 border-rose-300 rounded-2xl hover:border-rose-500 hover:bg-rose-50 hover:shadow-lg transition transform hover:scale-105 text-center"
            >
              <div className="text-6xl mb-4">🎓</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-rose-600 transition">
                Étudiant
              </h3>
              <p className="text-gray-600 group-hover:text-gray-700">
                S'inscrire à des cours, consulter vos notes et communiquer avec les professeurs
              </p>
            </div>

            {/* Teacher Option */}
            <div
              onClick={() => router.push('/login/teacher')}
              className="group cursor-pointer p-8 border-2 border-orange-300 rounded-2xl hover:border-orange-500 hover:bg-orange-50 hover:shadow-lg transition transform hover:scale-105 text-center"
            >
              <div className="text-6xl mb-4">👨‍🏫</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition">
                Professeur
              </h3>
              <p className="text-gray-600 group-hover:text-gray-700">
                Créer et gérer vos cours, noter les étudiants et communiquer
              </p>
            </div>
          </div>

          <div className="mt-12 p-6 bg-gradient-to-r from-rose-100 to-orange-100 border border-rose-300 rounded-xl">
            <p className="text-rose-700 text-sm font-semibold mb-3">ℹ️ Pas encore inscrit?</p>
            <a
              href="/register"
              className="inline-block px-6 py-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold rounded-lg hover:from-rose-600 hover:to-orange-600 transition"
            >
              Créer un compte
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
