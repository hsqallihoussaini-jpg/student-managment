'use client';

import { useState, useEffect } from 'react';

interface AttendanceRecord {
  id: number;
  studentId: number;
  courseId: number;
  sessionDate: string;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  courseName: string;
  markedAt: string;
}

export default function TeacherAttendancePage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionActive, setSessionActive] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [teacherInfo, setTeacherInfo] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const teacherResponse = await fetch('/api/teachers');
        const teacherData = await teacherResponse.json();
        if (Array.isArray(teacherData) && teacherData.length > 0) {
          setTeacherInfo(teacherData[0]);
        }

        const courseResponse = await fetch('/api/courses');
        const courseData = await courseResponse.json();
        setCourses(Array.isArray(courseData) ? courseData : []);

        const studentResponse = await fetch('/api/students');
        const studentData = await studentResponse.json();
        setStudents(Array.isArray(studentData) ? studentData : []);

        const attendanceResponse = await fetch('/api/attendance');
        const attendanceData = await attendanceResponse.json();
        setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
      } catch (error) {
        console.error('Error initializing:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleStartSession = () => {
    if (!selectedCourse) {
      alert('Sélectionnez un cours');
      return;
    }
    setSessionActive(true);
    setQrValue(`attendance-${selectedCourse}-${selectedDate}-${Date.now()}`);
  };

  const handleMarkAttendance = async (studentId: number, status: string) => {
    if (!selectedCourse) return;

    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse,
          studentId,
          sessionDate: selectedDate,
          status,
          qrCodeScanned: true
        })
      });

      if (response.ok) {
        const attendanceResponse = await fetch('/api/attendance');
        const attendanceData = await attendanceResponse.json();
        setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const getStudentAttendance = (studentId: number) => {
    return attendance.find(a => 
      a.studentId === studentId && 
      a.courseId === parseInt(selectedCourse) &&
      a.sessionDate.split('T')[0] === selectedDate
    );
  };

  const todayAttendance = attendance.filter(a => 
    a.courseId === parseInt(selectedCourse) &&
    a.sessionDate.split('T')[0] === selectedDate
  );

  const presentCount = todayAttendance.filter(a => a.status === 'present').length;
  const absentCount = todayAttendance.filter(a => a.status === 'absent').length;
  const lateCount = todayAttendance.filter(a => a.status === 'late').length;

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-800 mb-8">📋 Gestion de la Présence</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500">
            <h2 className="text-2xl font-semibold mb-4 text-slate-700">Session</h2>
            
            <div className="space-y-4">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full border border-slate-300 rounded px-4 py-2"
              >
                <option value="">Sélectionner un cours</option>
                {courses.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border border-slate-300 rounded px-4 py-2"
              />

              {!sessionActive ? (
                <button
                  onClick={handleStartSession}
                  className="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 transition font-semibold text-lg"
                >
                  🚀 Démarrer la Session
                </button>
              ) : (
                <div className="bg-green-100 border-2 border-green-500 rounded p-4 text-center">
                  <p className="font-semibold text-green-800 mb-3">Session active!</p>
                  <div className="bg-white p-4 rounded border-2 border-green-500">
                    <p className="text-sm text-slate-600 mb-2">Valeur QR:</p>
                    <input
                      type="text"
                      value={qrValue}
                      readOnly
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-mono text-center"
                    />
                    <p className="text-xs text-slate-500 mt-2">Les étudiants peuvent scanner ce code</p>
                  </div>
                  <button
                    onClick={() => setSessionActive(false)}
                    className="w-full mt-4 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
                  >
                    Arrêter la Session
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500">
            <h2 className="text-2xl font-semibold mb-4 text-slate-700">📊 Statistiques</h2>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-100 rounded p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                <div className="text-xs text-slate-600">Présents</div>
              </div>
              <div className="bg-red-100 rounded p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                <div className="text-xs text-slate-600">Absents</div>
              </div>
              <div className="bg-yellow-100 rounded p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{lateCount}</div>
                <div className="text-xs text-slate-600">Retard</div>
              </div>
            </div>
          </div>
        </div>

        {selectedCourse && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-6">
              <h3 className="text-2xl font-semibold">✏️ Marquer la Présence</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Nom</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Statut Actuel</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const att = getStudentAttendance(student.id);
                    const statusColor = att?.status === 'present' ? 'bg-green-100' : att?.status === 'absent' ? 'bg-red-100' : 'bg-yellow-100';
                    
                    return (
                      <tr key={student.id} className={`border-b hover:${statusColor}`}>
                        <td className="px-6 py-4 font-medium text-slate-800">{student.firstName} {student.lastName}</td>
                        <td className="px-6 py-4 text-slate-600">{student.email}</td>
                        <td className="px-6 py-4">
                          {att ? (
                            <span className={`px-3 py-1 rounded text-sm font-semibold ${
                              att.status === 'present' ? 'bg-green-200 text-green-800' :
                              att.status === 'absent' ? 'bg-red-200 text-red-800' :
                              'bg-yellow-200 text-yellow-800'
                            }`}>
                              {att.status === 'present' ? '✓ Présent' : att.status === 'absent' ? '✗ Absent' : '⏱️ Retard'}
                            </span>
                          ) : (
                            <span className="text-slate-500">Non marqué</span>
                          )}
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={() => handleMarkAttendance(student.id, 'present')}
                            className="bg-green-500 text-white px-3 py-1 text-sm rounded hover:bg-green-600 transition"
                          >
                            Présent
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(student.id, 'absent')}
                            className="bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600 transition"
                          >
                            Absent
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(student.id, 'late')}
                            className="bg-yellow-500 text-white px-3 py-1 text-sm rounded hover:bg-yellow-600 transition"
                          >
                            Retard
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
