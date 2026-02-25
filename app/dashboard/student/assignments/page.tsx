'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Assignment {
  id: number;
  title: string;
  description: string;
  courseId: number;
  courseName: string;
  dueDate: string;
  maxScore: number;
}

interface Submission {
  id: number;
  assignmentId: number;
  fileName: string;
  grade?: number;
  feedback?: string;
  submittedAt?: string;
}

export default function StudentAssignmentsPage() {
  const { data: session } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<{ [key: number]: Submission }>({});
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ [key: number]: File }>({});

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const studentResponse = await fetch('/api/students');
        const studentData = await studentResponse.json();
        if (Array.isArray(studentData) && studentData.length > 0) {
          const currentStudent = studentData[0];
          setStudentId(currentStudent.id);

          // Fetch assignments for student's courses
          const assignmentsResponse = await fetch('/api/assignments');
          const assignmentsData = await assignmentsResponse.json();
          setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);

          // Fetch student submissions
          const submissionsResponse = await fetch(`/api/submissions?studentId=${currentStudent.id}`);
          const submissionsData = await submissionsResponse.json();
          if (Array.isArray(submissionsData)) {
            const submissionMap: { [key: number]: Submission } = {};
            submissionsData.forEach((sub: Submission) => {
              submissionMap[sub.assignmentId] = sub;
            });
            setSubmissions(submissionMap);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  const handleSubmit = async (assignmentId: number) => {
    const file = selectedFile[assignmentId];
    if (!file || !studentId) {
      alert('Veuillez sélectionner un fichier');
      return;
    }

    try {
      const content = await file.text();
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId,
          studentId,
          fileName: file.name,
          fileContent: content
        })
      });

      if (response.ok) {
        alert('Devoir soumis avec succès');
        // Refresh submissions
        const submissionsResponse = await fetch(`/api/submissions?studentId=${studentId}`);
        const submissionsData = await submissionsResponse.json();
        if (Array.isArray(submissionsData)) {
          const submissionMap: { [key: number]: Submission } = {};
          submissionsData.forEach((sub: Submission) => {
            submissionMap[sub.assignmentId] = sub;
          });
          setSubmissions(submissionMap);
        }
        setSelectedFile({ ...selectedFile, [assignmentId]: undefined } as any);
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Erreur lors de la soumission');
    }
  };

  const getSubmissionStatus = (assignmentId: number) => {
    const submission = submissions[assignmentId];
    if (!submission) return 'Non soumis';
    if (submission.grade !== undefined && submission.grade !== null) return `Note: ${submission.grade}/${assignments.find(a => a.id === assignmentId)?.maxScore}`;
    return 'En cours de correction';
  };

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-800 mb-8">📝 Mes Devoirs</h1>

        <div className="grid gap-6">
          {assignments && assignments.length > 0 ? (
            assignments.map((assignment) => {
              const submission = submissions[assignment.id];
              const isOverdue = new Date(assignment.dueDate) < new Date();
              const isSubmitted = !!submission;

              return (
                <div
                  key={assignment.id}
                  className={`rounded-lg shadow-md p-6 transition border-l-4 ${
                    isSubmitted
                      ? 'bg-green-50 border-green-500'
                      : isOverdue
                      ? 'bg-red-50 border-red-500'
                      : 'bg-white border-blue-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-800">{assignment.title}</h3>
                      <p className="text-slate-600 mt-2">{assignment.description}</p>
                    </div>
                    <span className={`px-4 py-2 rounded text-white font-semibold ${
                      isSubmitted ? 'bg-green-500' : isOverdue ? 'bg-red-500' : 'bg-yellow-500'
                    }`}>
                      {isSubmitted ? '✓ Soumis' : isOverdue ? '⚠️ Retard' : '⏳ En attente'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-slate-600">
                    <div>📚 {assignment.courseName}</div>
                    <div>📅 {new Date(assignment.dueDate).toLocaleDateString('fr-FR')}</div>
                    <div>⭐ {assignment.maxScore} points</div>
                    <div>{getSubmissionStatus(assignment.id)}</div>
                  </div>

                  {isSubmitted && submission.feedback && (
                    <div className="bg-yellow-100 border border-yellow-300 rounded p-4 mb-4">
                      <p className="font-semibold text-yellow-800">💬 Feedback du professeur:</p>
                      <p className="text-yellow-700 mt-1">{submission.feedback}</p>
                    </div>
                  )}

                  {!isSubmitted && (
                    <div className="flex gap-4 items-center">
                      <input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setSelectedFile({ ...selectedFile, [assignment.id]: e.target.files[0] });
                          }
                        }}
                        className="border border-slate-300 rounded px-3 py-2 flex-1"
                      />
                      <button
                        onClick={() => handleSubmit(assignment.id)}
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
                      >
                        Soumettre
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
              <p className="text-lg">Aucun devoir pour le moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
