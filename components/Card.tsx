import React from 'react';
import { Question } from '../types';
import { Lightbulb } from 'lucide-react';

interface CardProps {
  question: Question;
  isFlipped: boolean;
  onFlip: () => void;
}

export const Card: React.FC<CardProps> = ({ question, isFlipped, onFlip }) => {
  return (
    <div className="relative w-full max-w-lg aspect-[3/4] sm:aspect-[4/3] group perspective-1000 cursor-pointer" onClick={onFlip}>
      <div 
        className={`relative w-full h-full duration-700 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front */}
        <div className="absolute w-full h-full bg-white rounded-xl shadow-xl p-6 sm:p-8 backface-hidden flex flex-col border-4 border-indigo-100">
            <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    {question.category || 'Trivia'}
                </span>
                <span className="text-xs font-bold text-slate-300">
                    Flip for Answer
                </span>
            </div>
            
            <div className="text-center mb-6">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight">
                    {question.text}
                </h3>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {question.options && question.options.map((opt, i) => (
                    <div 
                        key={i} 
                        className="flex items-center p-3 rounded-lg border-2 border-slate-100 bg-slate-50 text-slate-700 font-medium text-sm sm:text-base"
                    >
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold mr-3 shrink-0">
                            {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                    </div>
                ))}
            </div>

            <div className="absolute bottom-4 left-0 w-full text-center text-xs text-slate-400 font-medium animate-pulse opacity-50">
                Click card to reveal
            </div>
        </div>

        {/* Back */}
        <div className="absolute w-full h-full bg-indigo-600 rounded-xl shadow-xl p-6 backface-hidden rotate-y-180 flex flex-col items-center justify-center text-white overflow-hidden">
             <div className="absolute top-4 left-4 text-xs font-bold text-indigo-200 uppercase tracking-wider z-10">
                Correct Answer
            </div>
            
            <div className="flex flex-col items-center w-full h-full justify-center">
                 {/* Generated Image */}
                 {question.imageUrl && (
                     <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-xl border-4 border-white/30 shadow-2xl mb-4 overflow-hidden flex-shrink-0">
                         <img 
                            src={question.imageUrl} 
                            alt="Answer illustration" 
                            className="w-full h-full object-cover"
                         />
                     </div>
                 )}

                <div className="text-center transform rotate-0 z-10">
                    <p className={`font-bold leading-tight drop-shadow-md ${question.imageUrl ? 'text-2xl sm:text-3xl' : 'text-3xl md:text-5xl'}`}>
                        {question.answer}
                    </p>
                    {!question.imageUrl && (
                        <div className="mt-4 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium text-indigo-100 mb-2">
                            Did you get it right?
                        </div>
                    )}

                    {/* Fun Fact Section */}
                    {question.funFact && (
                        <div className="mt-4 mx-auto max-w-xs p-3 bg-indigo-800/40 rounded-lg backdrop-blur-md border border-indigo-400/20 text-indigo-50 relative">
                            <div className="absolute -top-3 -right-3 bg-yellow-400 text-indigo-900 rounded-full p-1 shadow-sm">
                                <Lightbulb size={12} fill="currentColor" />
                            </div>
                            <span className="block text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Fun Fact</span>
                            <p className="text-xs sm:text-sm font-medium leading-relaxed italic">
                                "{question.funFact}"
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};