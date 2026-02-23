'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  matricule: string;
  dateOfBirth: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  status: string;
  enrollmentDate: string;
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudent();
  }, [params.id]);

  const fetchStudent = async () => {
    try {
      const res = await fetch(`/api/students/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setStudent(data);
        setFormData(data);
      } else {
        setError('Étudiant non trouvé');
      }
    } catch (error) {
      setError('Erreur lors du chargement de l\'étudiant');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    
    try {
      const res = await fetch(`/api/students/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updated = await res.json();
        setStudent(updated);
        setIsEditing(false);
      }
    } catch (error) {
      setError('Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (!student) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {student.firstName} {student.lastName}
        </h1>
        <button
          onClick={() => router.back()}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Retour
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-bold mb-2">Prénom</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData?.firstName || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">Nom</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData?.lastName || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData?.email || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData?.phone || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Enregistrer
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData(student);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <span className="block text-gray-600 text-sm font-semibold">Email</span>
                <span className="text-gray-800">{student.email}</span>
              </div>
              <div>
                <span className="block text-gray-600 text-sm font-semibold">Téléphone</span>
                <span className="text-gray-800">{student.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-gray-600 text-sm font-semibold">Matricule</span>
                <span className="text-gray-800">{student.matricule}</span>
              </div>
              <div>
                <span className="block text-gray-600 text-sm font-semibold">Statut</span>
                <span className={`px-2 py-1 rounded text-sm ${student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {student.status}
                </span>
              </div>
              <div>
                <span className="block text-gray-600 text-sm font-semibold">Adresse</span>
                <span className="text-gray-800">{student.address || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-gray-600 text-sm font-semibold">Ville</span>
                <span className="text-gray-800">{student.city || 'N/A'}</span>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Modifier
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
