'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  matricule: string;
  status: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        const studentsList = Array.isArray(data) ? data : [];
        setStudents(studentsList);
      } else {
        setStudents([]);
        setError('Erreur lors du chargement des étudiants');
      }
    } catch (error) {
      setStudents([]);
      setError('Erreur lors du chargement des étudiants');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet étudiant?')) {
      try {
        const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setStudents(students.filter(s => s.id !== id));
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Liste des étudiants</h1>
        <Link href="/dashboard/add-student" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Ajouter un étudiant
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nom</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Matricule</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{student.firstName} {student.lastName}</td>
                  <td className="px-6 py-4">{student.email}</td>
                  <td className="px-6 py-4">{student.matricule}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-sm ${student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <Link href={`/dashboard/students/${student.id}`} className="text-blue-500 hover:underline">
                      Voir
                    </Link>
                    <button onClick={() => handleDelete(student.id)} className="text-red-500 hover:underline">
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
