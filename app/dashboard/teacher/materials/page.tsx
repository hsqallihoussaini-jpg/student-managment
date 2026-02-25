'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

export default function TeacherCourseMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    type: 'pdf',
    fileName: 'example.pdf',
    fileUrl: 'https://example.com/file.pdf',
    fileSize: 0,
    duration: 0
  });
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

        const materialsResponse = await fetch('/api/course-materials');
        const materialsData = await materialsResponse.json();
        setMaterials(Array.isArray(materialsData) ? materialsData : []);
      } catch (error) {
        console.error('Error initializing:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.courseId || !teacherInfo?.id) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      const response = await fetch('/api/course-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          courseId: parseInt(formData.courseId),
          teacherId: teacherInfo.id,
          fileSize: parseInt(formData.fileSize.toString())
        })
      });

      if (response.ok) {
        alert('Matériel créé avec succès');
        setFormData({ title: '', description: '', courseId: '', type: 'pdf', fileName: 'example.pdf', fileUrl: '', fileSize: 0, duration: 0 });
        setShowForm(false);
        
        const materialsResponse = await fetch('/api/course-materials');
        const materialsData = await materialsResponse.json();
        setMaterials(Array.isArray(materialsData) ? materialsData : []);
      }
    } catch (error) {
      console.error('Error creating material:', error);
      alert('Erreur lors de la création');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr?')) return;

    try {
      const response = await fetch(`/api/course-materials/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setMaterials(materials.filter(m => m.id !== id));
        alert('Matériel supprimé');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'video': return '🎥';
      case 'image': return '🖼️';
      case 'document': return '📃';
      default: return '📎';
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800">📚 Matériaux des Cours</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition"
          >
            {showForm ? 'Annuler' : '+ Ajouter Matériel'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-t-4 border-purple-500">
            <h2 className="text-2xl font-semibold mb-6 text-slate-700">Ajouter un matériel</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Titre"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-slate-300 rounded px-4 py-2 focus:outline-none focus:border-purple-500"
                required
              />

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-slate-300 rounded px-4 py-2"
                rows={3}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="border border-slate-300 rounded px-4 py-2"
                  required
                >
                  <option value="">Sélectionner un cours</option>
                  {courses.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="border border-slate-300 rounded px-4 py-2"
                >
                  <option value="pdf">📄 PDF</option>
                  <option value="video">🎥 Vidéo</option>
                  <option value="document">📃 Document</option>
                  <option value="image">🖼️ Image</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Nom du fichier"
                value={formData.fileName}
                onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                className="w-full border border-slate-300 rounded px-4 py-2"
                required
              />

              <input
                type="url"
                placeholder="URL du fichier"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                className="w-full border border-slate-300 rounded px-4 py-2"
              />

              <button
                type="submit"
                className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 transition font-semibold"
              >
                Ajouter le matériel
              </button>
            </form>
          </div>
        )}

        <div className="grid gap-6">
          {materials && materials.length > 0 ? (
            materials.map((material) => (
              <div key={material.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-l-4 border-purple-500">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(material.type)}</span>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-800">{material.title}</h3>
                        <p className="text-sm text-slate-600">{material.fileName}</p>
                      </div>
                    </div>
                    <p className="text-slate-600 mb-3">{material.description}</p>
                    <div className="flex gap-4 text-sm text-slate-500">
                      <span>📚 {material.courseName}</span>
                      <span>📅 {new Date(material.createdAt).toLocaleDateString('fr-FR')}</span>
                      <span>📊 {(material.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={material.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition text-sm"
                    >
                      Télécharger
                    </a>
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
              <p className="text-lg">Aucun matériel. Commencez par en ajouter un!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
