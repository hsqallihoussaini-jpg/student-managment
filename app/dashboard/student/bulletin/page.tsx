'use client';

import { useState, useEffect } from 'react';

interface Grade {
  id: number;
  courseId?: number;
  courseName?: string;
  assignmentId?: number;
  assignmentTitle?: string;
  grade: number;
  maxScore: number;
  feedback?: string;
  type: 'assignment' | 'quiz' | 'exam';
  date: string;
}

export default function StudentBulletinPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch student data
        const studentResponse = await fetch('/api/students');
        const studentData = await studentResponse.json();
        if (Array.isArray(studentData) && studentData.length > 0) {
          const currentStudent = studentData[0];
          setStudentId(currentStudent.id);
        }

        // Fetch enrolled courses
        const courseResponse = await fetch('/api/courses');
        const courseData = await courseResponse.json();
        setCourses(Array.isArray(courseData) ? courseData : []);

        // Fetch submissions with grades
        if (studentData[0]?.id) {
          const submissionsResponse = await fetch(`/api/submissions?studentId=${studentData[0].id}`);
          const submissionsData = await submissionsResponse.json();
          
          if (Array.isArray(submissionsData)) {
            const formattedGrades = submissionsData
              .filter((s: any) => s.grade !== null && s.grade !== undefined)
              .map((s: any) => ({
                id: s.id,
                assignmentId: s.assignmentId,
                assignmentTitle: s.assignmentTitle,
                grade: s.grade,
                maxScore: 20,
                feedback: s.feedback,
                type: 'assignment' as const,
                date: s.submittedAt || new Date().toISOString()
              }));
            
            setGrades(formattedGrades.sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            ));
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateStats = () => {
    if (grades.length === 0) return { average: 0, total: 0, percentage: 0 };
    
    const totalPoints = grades.reduce((sum, g) => sum + g.maxScore, 0);
    const earnedPoints = grades.reduce((sum, g) => sum + g.grade, 0);
    const average = totalPoints > 0 ? ((earnedPoints / totalPoints) * 20).toFixed(2) : 0;
    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    
    return { average, total: earnedPoints, percentage };
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 border-green-500';
    if (percentage >= 60) return 'bg-blue-100 border-blue-500';
    if (percentage >= 40) return 'bg-yellow-100 border-yellow-500';
    return 'bg-red-100 border-red-500';
  };

  const stats = calculateStats();

  if (loading) {
    return <div className="p-8 text-center">Chargement du bulletin...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-800 mb-8">📊 Mon Bulletin Numérique</h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
            <div className="text-4xl font-bold">{stats.average}</div>
            <div className="text-sm text-blue-100 mt-2">Moyenne Générale /20</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
            <div className="text-4xl font-bold">{stats.percentage}%</div>
            <div className="text-sm text-green-100 mt-2">Taux de Réussite</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-6">
            <div className="text-4xl font-bold">{grades.length}</div>
            <div className="text-sm text-orange-100 mt-2">Évaluations</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
            <div className="text-4xl font-bold">{stats.total.toFixed(0)}</div>
            <div className="text-sm text-purple-100 mt-2">Points Totaux</div>
          </div>
        </div>

        {/* Grades Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-6">
            <h2 className="text-2xl font-semibold">Détail des Notes</h2>
          </div>

          {grades && grades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Évaluation</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Note</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Pourcentage</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade, idx) => {
                    const percentage = Math.round((grade.grade / grade.maxScore) * 100);
                    const isPassed = percentage >= 50;
                    
                    return (
                      <tr key={idx} className={`border-b hover:bg-slate-50 ${getGradeColor(percentage)}`}>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(grade.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-800">
                          {grade.assignmentTitle}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="font-bold text-lg">{grade.grade}</span>
                          <span className="text-slate-500 ml-2">/ {grade.maxScore}</span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center">
                            <div className="w-full bg-slate-200 rounded-full h-2 mr-2">
                              <div
                                className={`h-2 rounded-full ${isPassed ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-semibold">{percentage}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded text-white text-xs font-semibold ${
                            isPassed ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {isPassed ? '✓ Réussi' : '✗ Non réussi'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <p className="text-lg">Aucune note pour le moment</p>
              <p className="text-sm mt-2">Vos notes apparaîtront ici une fois évaluées</p>
            </div>
          )}
        </div>

        {/* Feedback Section */}
        {grades.some(g => g.feedback) && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">💬 Commentaires des professeurs</h2>
            <div className="space-y-4">
              {grades
                .filter(g => g.feedback)
                .map((grade, idx) => (
                  <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    <p className="font-semibold text-slate-800">{grade.assignmentTitle}</p>
                    <p className="text-slate-700 mt-2">{grade.feedback}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
