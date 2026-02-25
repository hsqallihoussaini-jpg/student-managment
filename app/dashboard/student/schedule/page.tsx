'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ScheduleItem {
  id: number;
  studentId: number;
  courseId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  instructor: string;
  courseName: string;
  courseCode: string;
}

interface Course {
  id: number;
  name: string;
  code: string;
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const TIMES = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

export default function StudentSchedulePage() {
  const router = useRouter();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentId, setStudentId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    courseId: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    room: '',
    instructor: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get session and student info
        const sessionResponse = await fetch('/api/auth/session');
        const session = await sessionResponse.json();

        if (!session?.user?.email) {
          router.push('/login');
          return;
        }

        const studentsResponse = await fetch('/api/students');
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          const studentsList = Array.isArray(studentsData) ? studentsData : [];
          const student = studentsList.find((s: any) => s.email === session.user.email);

          if (!student) {
            router.push('/login');
            return;
          }

          setStudentId(student.id);

          // Get enrolled courses
          const coursesResponse = await fetch(`/api/students/${student.id}/courses`);
          if (coursesResponse.ok) {
            const coursesData = await coursesResponse.json();
            const coursesList = Array.isArray(coursesData) ? coursesData : [];
            setCourses(coursesList);
          }

          // Get schedule
          const scheduleResponse = await fetch(`/api/students/schedule?studentId=${student.id}`);
          if (scheduleResponse.ok) {
            const scheduleData = await scheduleResponse.json();
            setSchedule(Array.isArray(scheduleData) ? scheduleData : []);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !formData.courseId || !formData.dayOfWeek || !formData.startTime || !formData.endTime) return;

    try {
      if (editingScheduleId) {
        // Update existing schedule
        const response = await fetch(`/api/students/schedule/${editingScheduleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dayOfWeek: formData.dayOfWeek,
            startTime: formData.startTime,
            endTime: formData.endTime,
            room: formData.room,
            instructor: formData.instructor,
          }),
        });

        if (!response.ok) throw new Error('Erreur lors de la mise à jour');

        setEditingScheduleId(null);
      } else {
        // Create new schedule
        const response = await fetch('/api/students/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            courseId: parseInt(formData.courseId),
            dayOfWeek: formData.dayOfWeek,
            startTime: formData.startTime,
            endTime: formData.endTime,
            room: formData.room,
            instructor: formData.instructor,
          }),
        });

        if (!response.ok) throw new Error('Erreur lors de la création');
      }

      // Refresh schedule
      const scheduleResponse = await fetch(`/api/students/schedule?studentId=${studentId}`);
      if (scheduleResponse.ok) {
        const scheduleData = await scheduleResponse.json();
        setSchedule(Array.isArray(scheduleData) ? scheduleData : []);
      }

      setFormData({
        courseId: '',
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        room: '',
        instructor: '',
      });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours de l\'emploi du temps ?')) return;

    try {
      const response = await fetch(`/api/students/schedule/${scheduleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      setSchedule(schedule.filter(s => s.id !== scheduleId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleEditSchedule = (item: ScheduleItem) => {
    setEditingScheduleId(item.id);
    setFormData({
      courseId: item.courseId.toString(),
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
      room: item.room,
      instructor: item.instructor,
    });
    setShowForm(true);
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
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">⏰ Mon Emploi du Temps</h1>
        <p className="text-gray-600">Organisez vos cours et vos horaires</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => {
            setShowForm(true);
            setEditingScheduleId(null);
            setFormData({
              courseId: '',
              dayOfWeek: '',
              startTime: '',
              endTime: '',
              room: '',
              instructor: '',
            });
          }}
          className="mb-6 px-6 py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold rounded-lg hover:from-rose-600 hover:to-orange-600 transition"
        >
          ➕ Ajouter un cours à l'emploi du temps
        </button>
      )}

      {showForm && (
        <div className="mb-8 bg-white rounded-lg shadow-lg p-6 border-l-4 border-rose-500">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">
            {editingScheduleId ? '✏️ Modifier le cours' : '📅 Ajouter un cours'}
          </h3>
          <form onSubmit={handleAddSchedule} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matière *
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                >
                  <option value="">Sélectionnez une matière...</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jour *
                </label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                >
                  <option value="">Sélectionnez un jour...</option>
                  {DAYS.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de début *
                </label>
                <select
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                >
                  <option value="">Sélectionnez l'heure...</option>
                  {TIMES.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de fin *
                </label>
                <select
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                >
                  <option value="">Sélectionnez l'heure...</option>
                  {TIMES.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                placeholder="Salle (ex: 101)"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              />

              <input
                type="text"
                placeholder="Enseignant"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold py-2 rounded-lg hover:from-rose-600 hover:to-orange-600 transition"
              >
                ✅ Enregistrer
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingScheduleId(null);
                  setFormData({
                    courseId: '',
                    dayOfWeek: '',
                    startTime: '',
                    endTime: '',
                    room: '',
                    instructor: '',
                  });
                }}
                className="flex-1 bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-300 transition"
              >
                ❌ Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {schedule.length === 0 ? (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded text-center text-blue-700">
          <p>Aucun cours dans votre emploi du temps. Ajoutez vos premiers cours! 📅</p>
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-rose-500 to-orange-500 text-white">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Jour</th>
                  <th className="px-6 py-3 text-left font-semibold">Matière</th>
                  <th className="px-6 py-3 text-left font-semibold">Heure</th>
                  <th className="px-6 py-3 text-left font-semibold">Salle</th>
                  <th className="px-6 py-3 text-left font-semibold">Enseignant</th>
                  <th className="px-6 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 font-semibold text-gray-800">{item.dayOfWeek}</td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-800">{item.courseName}</span>
                      <p className="text-sm text-gray-500">{item.courseCode}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{item.startTime} - {item.endTime}</td>
                    <td className="px-6 py-4 text-gray-700">{item.room || '-'}</td>
                    <td className="px-6 py-4 text-gray-700">{item.instructor || '-'}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleEditSchedule(item)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(item.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
