import React from 'react';
import { Question } from '../types';
import { Trash2 } from 'lucide-react';

interface QuestionListProps {
  questions: Question[];
  onDelete: (id: string) => void;
}

export const QuestionList: React.FC<QuestionListProps> = ({ questions, onDelete }) => {
  if (questions.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400 bg-white rounded-lg border-2 border-dashed border-slate-200">
        <p>No questions yet. Add some above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((q, index) => (
        <div key={q.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex justify-between items-start group hover:border-indigo-200 transition-colors">
          <div>
            <span className="text-xs font-bold text-indigo-500 uppercase mb-1 block">
                Question {index + 1} • {q.category || 'General'}
            </span>
            <p className="font-semibold text-slate-800">{q.text}</p>
            <p className="text-slate-500 text-sm mt-1">A: {q.answer}</p>
          </div>
          <button 
            onClick={() => onDelete(q.id)}
            className="text-slate-300 hover:text-red-500 transition-colors p-2"
            title="Delete Question"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};
