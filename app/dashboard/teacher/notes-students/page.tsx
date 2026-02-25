'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface StudentNote {
  id: number;
  studentId: number;
  courseId: number | null;
  grade: string;
  notes: string;
  firstName: string;
  lastName: string;
  courseName: string;
  updatedAt: string;
}

export default function TeacherNotesStudentsPage() {
  const router = useRouter();
  const [studentNotes, setStudentNotes] = useState<StudentNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    grade: '',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get session and teacher info
        const sessionResponse = await fetch('/api/auth/session');
        const session = await sessionResponse.json();
        
        if (!session?.user?.email) {
          router.push('/login');
          return;
        }

        const teachersResponse = await fetch('/api/teachers');
        const teachersData = await teachersResponse.json();
        const teacher = teachersData.find((t: any) => t.email === session.user.email);
        
        if (!teacher) {
          router.push('/login');
          return;
        }

        setTeacherId(teacher.id);

        // Get all students
        const studentsResponse = await fetch('/api/students');
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          const studentsList = Array.isArray(studentsData) ? studentsData : [];
          setStudents(studentsList);
        } else {
          setStudents([]);
        }

        // Get teacher's notes
        const notesResponse = await fetch(`/api/teachers/grades?teacherId=${teacher.id}`);
        if (notesResponse.ok) {
          const notesData = await notesResponse.json();
          const notesList = Array.isArray(notesData) ? notesData : [];
          setStudentNotes(notesList);
        } else {
          setStudentNotes([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
        setStudents([]);
        setStudentNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId || !selectedStudent) return;

    try {
      const response = await fetch('/api/teachers/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId,
          studentId: selectedStudent,
          grade: formData.grade,
          notes: formData.notes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'ajout de la note');
      }

      // Refresh notes
      const notesResponse = await fetch(`/api/teachers/grades?teacherId=${teacherId}`);
      const notesData = await notesResponse.json();
      setStudentNotes(notesData);

      setFormData({ grade: '', notes: '' });
      setSelectedStudent(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout de la note');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📋 Notes sur les étudiants</h1>
        <p className="text-gray-600">Écrivez des notes personnelles et des observations sur vos élèves</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire d'ajout */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-rose-500">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">Ajouter une note</h3>
          <form onSubmit={handleAddNote} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionnez un étudiant
              </label>
              <select
                value={selectedStudent || ''}
                onChange={(e) => setSelectedStudent(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              >
                <option value="">Choisir un étudiant...</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note/Évaluation
              </label>
              <input
                type="text"
                name="grade"
                placeholder="A, B, C, D, F, etc."
                value={formData.grade}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (observations)
              </label>
              <textarea
                name="notes"
                placeholder="Écrivez vos observations, commentaires..."
                value={formData.notes}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedStudent}
              className="w-full bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold py-2 rounded-lg hover:from-rose-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✅ Ajouter la note
            </button>
          </form>
        </div>

        {/* Liste des notes */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800">Vos notes</h3>
            {studentNotes.length === 0 ? (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded text-center text-blue-700">
                <p>Aucune note ajoutée pour le moment</p>
              </div>
            ) : (
              studentNotes.map(note => (
                <div
                  key={note.id}
                  className="bg-white border-l-4 border-orange-500 rounded-lg shadow-md p-6 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">
                        {note.firstName} {note.lastName}
                      </h4>
                      {note.courseName && (
                        <p className="text-sm text-gray-600">Cours: {note.courseName}</p>
                      )}
                    </div>
                    {note.grade && (
                      <span className="bg-gradient-to-r from-rose-500 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-lg">
                        {note.grade}
                      </span>
                    )}
                  </div>
                  
                  {note.notes && (
                    <div>
                      <p className="text-gray-700 whitespace-pre-wrap">{note.notes}</p>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-3">
                    Dernière mise à jour: {new Date(note.updatedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
