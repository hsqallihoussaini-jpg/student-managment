'use client';

import { useState, useEffect } from 'react';

interface Material {
  id: number;
  title: string;
  description: string;
  type: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  duration?: number;
  courseName: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export default function StudentCourseMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch enrolled courses
        const courseResponse = await fetch('/api/courses');
        const courseData = await courseResponse.json();
        setCourses(Array.isArray(courseData) ? courseData : []);

        // Fetch materials
        const materialsResponse = await fetch('/api/course-materials');
        const materialsData = await materialsResponse.json();
        setMaterials(Array.isArray(materialsData) ? materialsData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'video': return '🎥';
      case 'image': return '🖼️';
      case 'document': return '📃';
      default: return '📎';
    }
  };

  const filteredMaterials = selectedCourse === 'all' 
    ? materials 
    : materials.filter(m => m.courseName === selectedCourse);

  if (loading) return <div className="p-8 text-center">Chargement des matériaux...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-800 mb-8">📚 Supports de Cours</h1>

        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCourse('all')}
            className={`px-4 py-2 rounded transition ${
              selectedCourse === 'all' ? 'bg-blue-500 text-white' : 'bg-white border border-slate-300'
            }`}
          >
            Tous les cours
          </button>
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => setSelectedCourse(course.name)}
              className={`px-4 py-2 rounded transition ${
                selectedCourse === course.name ? 'bg-blue-500 text-white' : 'bg-white border border-slate-300'
              }`}
            >
              {course.name}
            </button>
          ))}
        </div>

        <div className="grid gap-6">
          {filteredMaterials && filteredMaterials.length > 0 ? (
            filteredMaterials.map((material) => (
              <div key={material.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-l-4 border-purple-500">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{getTypeIcon(material.type)}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">{material.title}</h3>
                    <p className="text-slate-600 mb-3">{material.description}</p>
                    <div className="flex gap-4 text-sm text-slate-500 mb-4">
                      <span>📚 {material.courseName}</span>
                      <span>👨‍🏫 Dr {material.firstName} {material.lastName}</span>
                      <span>📅 {new Date(material.createdAt).toLocaleDateString('fr-FR')}</span>
                      <span>📊 {(material.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                      {material.duration && <span>⏱️ {material.duration} min</span>}
                    </div>
                    <a
                      href={material.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition font-semibold"
                    >
                      📥 Télécharger {material.fileName}
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
              <p className="text-lg">Aucun matériel disponible pour ce cours</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
