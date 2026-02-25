'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Question {
  id: number;
  questionText: string;
  questionType: string;
  options: string[];
  points: number;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  courseName: string;
  totalPoints: number;
  timeLimit: number;
  dueDate: string;
  questions: Question[];
}

export default function TeacherQuizDetailPage() {
  const params = useParams();
  const quizId = params?.id;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    points: 1
  });

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`);
      if (response.ok) {
        const data = await response.json();
        setQuiz(data);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.questionText || newQuestion.options.some(o => !o)) {
      alert('Veuillez remplir toutes les options de la question');
      return;
    }

    try {
      const response = await fetch('/api/quiz-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          questionText: newQuestion.questionText,
          questionType: 'mcq',
          options: newQuestion.options,
          correctAnswer: newQuestion.options[newQuestion.correctAnswer],
          points: newQuestion.points
        })
      });

      if (response.ok) {
        alert('Question ajoutée');
        setNewQuestion({ questionText: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 });
        setShowQuestionForm(false);
        fetchQuiz();
      }
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (!quiz) return <div className="p-8 text-center">Quiz non trouvé</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
        <p className="text-slate-600 mb-6">{quiz.description}</p>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{quiz.totalPoints}</div>
              <div className="text-sm text-slate-600">Points totaux</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{quiz.timeLimit}</div>
              <div className="text-sm text-slate-600">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{quiz.questions?.length || 0}</div>
              <div className="text-sm text-slate-600">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-lg">{new Date(quiz.dueDate).toLocaleDateString('fr-FR')}</div>
              <div className="text-sm text-slate-600">Date limite</div>
            </div>
          </div>

          <button
            onClick={() => setShowQuestionForm(!showQuestionForm)}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
          >
            {showQuestionForm ? 'Annuler' : '+ Ajouter une question'}
          </button>
        </div>

        {showQuestionForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Nouvelle question</h2>
            <input
              type="text"
              placeholder="Énoncé de la question"
              value={newQuestion.questionText}
              onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
              className="w-full border border-slate-300 rounded px-4 py-2 mb-4 focus:outline-none focus:border-blue-500"
            />

            <div className="space-y-2 mb-4">
              {newQuestion.options.map((option, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Option ${idx + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...newQuestion.options];
                    newOptions[idx] = e.target.value;
                    setNewQuestion({ ...newQuestion, options: newOptions });
                  }}
                  className="w-full border border-slate-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <select
                value={newQuestion.correctAnswer}
                onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: parseInt(e.target.value) })}
                className="border border-slate-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
              >
                {newQuestion.options.map((_, idx) => (
                  <option key={idx} value={idx}>Bonne réponse: Option {idx + 1}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Points"
                value={newQuestion.points}
                onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) })}
                className="border border-slate-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleAddQuestion}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
            >
              Ajouter cette question
            </button>
          </div>
        )}

        <div className="space-y-4">
          {quiz.questions && quiz.questions.length > 0 ? (
            quiz.questions.map((question, idx) => (
              <div key={question.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-lg mb-3">
                  Question {idx + 1} ({question.points} points)
                </h3>
                <p className="text-slate-700 mb-3">{question.questionText}</p>
                <ul className="space-y-2">
                  {question.options.map((option, optIdx) => (
                    <li key={optIdx} className="text-slate-600">
                      • {option}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-slate-500">
              Aucune question. Commencez par en ajouter une!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
