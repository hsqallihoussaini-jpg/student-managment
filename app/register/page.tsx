'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [roleSelection, setRoleSelection] = useState<'student' | 'teacher' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [teacherData, setTeacherData] = useState({
    department: '',
    specialization: '',
    office: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTeacherChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTeacherData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      const endpoint = roleSelection === 'student' ? '/api/auth/register-student' : '/api/auth/register-teacher';
      
      const payload = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        ...(roleSelection === 'teacher' && teacherData),
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      router.push('/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  if (!roleSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-gradient-to-r from-rose-500 to-orange-500">
            <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
              Créer un compte
            </h1>
            <p className="text-center text-gray-600 mb-8">Sélectionnez votre rôle</p>

            <div className="space-y-4">
              <button
                onClick={() => setRoleSelection('student')}
                className="w-full p-6 border-2 border-rose-300 rounded-xl hover:border-rose-500 hover:bg-rose-50 transition text-center"
              >
                <div className="text-4xl mb-2">🎓</div>
                <h3 className="text-xl font-bold text-gray-800">Étudiant</h3>
                <p className="text-sm text-gray-600 mt-2">S'inscrire et gérer vos cours</p>
              </button>

              <button
                onClick={() => setRoleSelection('teacher')}
                className="w-full p-6 border-2 border-orange-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition text-center"
              >
                <div className="text-4xl mb-2">👨‍🏫</div>
                <h3 className="text-xl font-bold text-gray-800">Professeur</h3>
                <p className="text-sm text-gray-600 mt-2">Créer et gérer vos cours</p>
              </button>
            </div>

            <p className="text-center text-gray-600 mt-8">
              Déjà inscrit?{' '}
              <Link href="/login" className="text-rose-500 hover:text-rose-600 font-semibold">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-gradient-to-r from-rose-500 to-orange-500">
          <button
            onClick={() => setRoleSelection(null)}
            className="text-gray-600 hover:text-gray-800 text-2xl mb-4"
          >
            ← Retour
          </button>

          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
            {roleSelection === 'student' ? '🎓 Inscription Étudiant' : '👨‍🏫 Inscription Professeur'}
          </h1>
          <p className="text-gray-600 mb-6">Remplissez le formulaire pour créer votre compte</p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="Prénom"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Nom"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              />
            </div>

            <input
              type="tel"
              name="phone"
              placeholder="Téléphone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
            />

            {roleSelection === 'teacher' && (
              <>
                <select
                  name="department"
                  value={teacherData.department}
                  onChange={handleTeacherChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                >
                  <option value="">Sélectionnez un département</option>
                  <option value="Informatique">Informatique</option>
                  <option value="Mathématiques">Mathématiques</option>
                  <option value="Sciences">Sciences</option>
                  <option value="Littérature">Littérature</option>
                  <option value="Histoire">Histoire</option>
                  <option value="Langues">Langues</option>
                </select>

                <input
                  type="text"
                  name="specialization"
                  placeholder="Spécialisation"
                  value={teacherData.specialization}
                  onChange={handleTeacherChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                />

                <input
                  type="text"
                  name="office"
                  placeholder="Bureau"
                  value={teacherData.office}
                  onChange={handleTeacherChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                />
              </>
            )}

            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmer le mot de passe"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold py-3 rounded-lg hover:from-rose-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Inscription...' : '✅ S\'inscrire'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-4">
            Déjà inscrit?{' '}
            <Link href="/login" className="text-rose-500 hover:text-rose-600 font-semibold">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
