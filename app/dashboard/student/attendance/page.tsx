'use client';

import { useState, useEffect } from 'react';

interface AttendanceRecord {
  id: number;
  courseId: number;
  sessionDate: string;
  status: string;
  courseName: string;
  markedAt: string;
}

export default function StudentAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [studentInfo, setStudentInfo] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const studentRes = await fetch('/api/students');
        const studentData = await studentRes.json();
        if (Array.isArray(studentData) && studentData.length > 0) {
          setStudentInfo(studentData[0]);
        }

        const courseRes = await fetch('/api/courses');
        const courseData = await courseRes.json();
        setCourses(Array.isArray(courseData) ? courseData : []);

        const attRes = await fetch('/api/attendance');
        const attData = await attRes.json();
        setAttendance(Array.isArray(attData) ? attData : []);
      } catch (error) {
        console.error('Error initializing:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const getCourseName = (courseId: number) => {
    return courses.find((c: any) => c.id === courseId)?.name || 'Cours inconnu';
  };

  const filteredAttendance = selectedCourse === 'all'
    ? attendance
    : attendance.filter(a => a.courseId === parseInt(selectedCourse));

  const getAttendanceStats = (courseId?: number) => {
    const data = courseId ? attendance.filter(a => a.courseId === courseId) : attendance;
    const total = data.length;
    const present = data.filter(a => a.status === 'present').length;
    const absent = data.filter(a => a.status === 'absent').length;
    const late = data.filter(a => a.status === 'late').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, late, percentage };
  };

  const overallStats = getAttendanceStats();

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-800 mb-8">📋 Ma Présence</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500">
            <div className="text-3xl font-bold text-blue-600">{overallStats.total}</div>
            <div className="text-sm text-slate-600">Séances</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500">
            <div className="text-3xl font-bold text-green-600">{overallStats.present}</div>
            <div className="text-sm text-slate-600">Présent</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-red-500">
            <div className="text-3xl font-bold text-red-600">{overallStats.absent}</div>
            <div className="text-sm text-slate-600">Absent</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-yellow-500">
            <div className="text-3xl font-bold text-yellow-600">{overallStats.percentage}%</div>
            <div className="text-sm text-slate-600">Taux Présence</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-t-4 border-rose-500">
          <h2 className="text-2xl font-semibold mb-4 text-slate-700">Filtrer par Cours</h2>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCourse('all')}
              className={`px-4 py-2 rounded font-semibold transition ${
                selectedCourse === 'all'
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Tous les cours
            </button>
            {courses.map((course: any) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course.id.toString())}
                className={`px-4 py-2 rounded font-semibold transition ${
                  selectedCourse === course.id.toString()
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {course.name}
              </button>
            ))}
          </div>
        </div>

        {selectedCourse !== 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {(() => {
              const stats = getAttendanceStats(parseInt(selectedCourse));
              return (
                <>
                  <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500">
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                    <div className="text-sm text-slate-600">Séances</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500">
                    <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                    <div className="text-sm text-slate-600">Présent</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-red-500">
                    <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                    <div className="text-sm text-slate-600">Absent</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-yellow-500">
                    <div className="text-2xl font-bold text-yellow-600">{stats.percentage}%</div>
                    <div className="text-sm text-slate-600">Taux Présence</div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white p-6">
            <h3 className="text-2xl font-semibold">📊 Historique de Présence</h3>
          </div>

          {filteredAttendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Cours</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Date de Session</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Statut</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Date de Marquage</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance
                    .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
                    .map((record) => (
                      <tr key={record.id} className="border-b hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {getCourseName(record.courseId)}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(record.sessionDate).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded text-sm font-semibold ${
                            record.status === 'present' ? 'bg-green-200 text-green-800' :
                            record.status === 'absent' ? 'bg-red-200 text-red-800' :
                            'bg-yellow-200 text-yellow-800'
                          }`}>
                            {record.status === 'present' ? '✓ Présent' : 
                             record.status === 'absent' ? '✗ Absent' : 
                             '⏱️ Retard'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm">
                          {new Date(record.markedAt).toLocaleString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <p className="text-lg">Aucun enregistrement de présence</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
