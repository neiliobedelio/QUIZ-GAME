import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Question, AppMode } from './types';
import { Card } from './components/Card';
import { QuestionList } from './components/QuestionList';
import { LiveHost } from './components/LiveHost';
import { Plus, Play, Edit2, ArrowRight, ArrowLeft, RefreshCw, Sparkles, Save, Image as ImageIcon, Wand2, Loader2, Lightbulb } from 'lucide-react';

const INITIAL_QUESTIONS: Question[] = [
    { 
      id: '1', 
      text: "What is my favorite comfort food?", 
      answer: "Mac and Cheese", 
      options: ["Pizza", "Mac and Cheese", "Sushi", "Ice Cream"],
      category: "Food",
      funFact: "Thomas Jefferson popularized Mac and Cheese in America after trying it in Paris."
    },
    { 
      id: '2', 
      text: "Which city was I born in?", 
      answer: "Chicago", 
      options: ["New York", "Los Angeles", "Chicago", "Houston"],
      category: "Origins",
      funFact: "The name Chicago comes from a Native American word for wild garlic that grew in the area."
    },
    { 
      id: '3', 
      text: "What was the name of my first pet?", 
      answer: "Buster", 
      options: ["Buster", "Fluffy", "Rex", "Luna"],
      category: "History",
      funFact: "Buster is one of the most popular dog names of the last 100 years."
    },
];

const shuffleArray = (array: string[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function App() {
  const [mode, setMode] = useState<AppMode>('entry');
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('birthday_quiz_data');
    return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
  });

  // Entry Form State
  const [newQText, setNewQText] = useState('');
  const [newQAnswer, setNewQAnswer] = useState('');
  const [newQDistractor1, setNewQDistractor1] = useState('');
  const [newQDistractor2, setNewQDistractor2] = useState('');
  const [newQDistractor3, setNewQDistractor3] = useState('');
  const [newQCategory, setNewQCategory] = useState('');
  const [newQFunFact, setNewQFunFact] = useState('');
  
  // Image Generation State
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  // Fun Fact Generation State
  const [isGeneratingFact, setIsGeneratingFact] = useState(false);

  // Play Mode State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    localStorage.setItem('birthday_quiz_data', JSON.stringify(questions));
  }, [questions]);

  // Update default image prompt when answer changes
  useEffect(() => {
    if (newQAnswer && !generatedImage) {
        setImagePrompt(`A colorful, minimalist illustration of ${newQAnswer}`);
    }
  }, [newQAnswer, generatedImage]);

  const handleGenerateFunFact = async () => {
      if (!newQAnswer) return;
      setIsGeneratingFact(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Generate a single, short, amusing or interesting fun fact about "${newQAnswer}". Keep it under 25 words. Do not include quotes.`,
        });
        if (response.text) {
            setNewQFunFact(response.text.trim());
        }
      } catch (e) {
        console.error("Fact generation failed", e);
      } finally {
        setIsGeneratingFact(false);
      }
  };

  const handleGenerateImage = async (isRefinement: boolean = false) => {
    if (!imagePrompt) return;
    setIsGeneratingImage(true);
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = 'gemini-2.5-flash-image';
        
        let contents;
        
        if (isRefinement && generatedImage) {
            // Edit existing image
            const base64Data = generatedImage.split(',')[1];
            contents = {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: base64Data } },
                    { text: imagePrompt }
                ]
            };
        } else {
            // Generate new image
            contents = {
                parts: [{ text: imagePrompt }]
            };
        }

        const response = await ai.models.generateContent({
            model,
            contents,
            config: {
                imageConfig: { aspectRatio: '1:1' }
            }
        });

        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                    setGeneratedImage(imageUrl);
                    // Clear prompt after generation to encourage new refinement prompts or reset
                    if (isRefinement) setImagePrompt(''); 
                    break;
                }
            }
        }
    } catch (error) {
        console.error("Image generation failed:", error);
        alert("Failed to generate image. Please try again.");
    } finally {
        setIsGeneratingImage(false);
    }
  };

  const addQuestion = () => {
    if (!newQText.trim() || !newQAnswer.trim() || !newQDistractor1.trim()) return;
    
    // Combine answer and distractors, then shuffle
    const allOptions = [newQAnswer, newQDistractor1, newQDistractor2, newQDistractor3].filter(opt => opt.trim() !== '');
    const shuffledOptions = shuffleArray(allOptions);

    const newQ: Question = {
      id: Date.now().toString(),
      text: newQText,
      answer: newQAnswer,
      options: shuffledOptions.length >= 2 ? shuffledOptions : allOptions,
      category: newQCategory || 'Trivia',
      imageUrl: generatedImage || undefined,
      funFact: newQFunFact || undefined,
    };

    setQuestions([...questions, newQ]);
    
    // Reset form
    setNewQText('');
    setNewQAnswer('');
    setNewQDistractor1('');
    setNewQDistractor2('');
    setNewQDistractor3('');
    setNewQCategory('');
    setNewQFunFact('');
    setGeneratedImage(null);
    setImagePrompt('');
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % questions.length);
    }, 200);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev - 1 + questions.length) % questions.length);
    }, 200);
  };

  const resetGame = () => {
      setIsFlipped(false);
      setCurrentCardIndex(0);
  }

  const isFormValid = newQText.trim() && newQAnswer.trim() && newQDistractor1.trim();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <Sparkles size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hidden sm:block">
              Birthday Know-It-All
            </h1>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setMode('entry')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === 'entry' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Edit2 size={16} />
              <span className="hidden sm:inline">Edit Questions</span>
            </button>
            <button
              onClick={() => {
                  setMode('play');
                  resetGame();
              }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === 'play' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Play size={16} />
              <span className="hidden sm:inline">Play Mode</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6">
        
        {/* ENTRY MODE */}
        {mode === 'entry' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Plus size={20} className="text-indigo-500"/>
                    Add Question
                </h2>
                
                <div className="space-y-4">
                  {/* Question Inputs */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Question Text</label>
                    <textarea
                      value={newQText}
                      onChange={(e) => setNewQText(e.target.value)}
                      placeholder="e.g., What is my favorite movie?"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none h-20 text-sm"
                    />
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                    <label className="block text-xs font-bold text-green-700 uppercase tracking-wide mb-1">Correct Answer</label>
                    <input
                      type="text"
                      value={newQAnswer}
                      onChange={(e) => setNewQAnswer(e.target.value)}
                      placeholder="The right answer"
                      className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Wrong Answers (Distractors)</label>
                      <input
                        type="text"
                        value={newQDistractor1}
                        onChange={(e) => setNewQDistractor1(e.target.value)}
                        placeholder="Wrong Option 1"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      />
                      <input
                        type="text"
                        value={newQDistractor2}
                        onChange={(e) => setNewQDistractor2(e.target.value)}
                        placeholder="Wrong Option 2"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      />
                      <input
                        type="text"
                        value={newQDistractor3}
                        onChange={(e) => setNewQDistractor3(e.target.value)}
                        placeholder="Wrong Option 3"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      />
                  </div>
                  
                  {/* Fun Fact Section */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Fun Fact (Optional)</label>
                        <button
                            onClick={handleGenerateFunFact}
                            disabled={!newQAnswer || isGeneratingFact}
                            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 disabled:opacity-50"
                        >
                            {isGeneratingFact ? <Loader2 size={12} className="animate-spin" /> : <Lightbulb size={12} />}
                            {isGeneratingFact ? 'Thinking...' : 'Generate with AI'}
                        </button>
                    </div>
                    <textarea
                      value={newQFunFact}
                      onChange={(e) => setNewQFunFact(e.target.value)}
                      placeholder="Enter a fun fact about the answer..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none h-16 text-sm"
                    />
                  </div>
                   
                   {/* Image Generation Section */}
                   <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                      <label className="block text-xs font-bold text-indigo-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                        <ImageIcon size={14} /> Answer Image (AI)
                      </label>
                      
                      {generatedImage ? (
                          <div className="mb-3 relative group">
                              <img src={generatedImage} alt="Generated answer" className="w-full h-40 object-cover rounded-md border border-indigo-200" />
                              <button 
                                onClick={() => setGeneratedImage(null)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                  <Plus size={14} className="rotate-45" />
                              </button>
                          </div>
                      ) : null}

                      <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={imagePrompt}
                            onChange={(e) => setImagePrompt(e.target.value)}
                            placeholder={generatedImage ? "e.g., Add a retro filter" : "Describe image..."}
                            className="flex-1 px-2 py-1.5 text-sm border border-indigo-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <button
                            onClick={() => handleGenerateImage(!!generatedImage)}
                            disabled={!imagePrompt || isGeneratingImage}
                            className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            title={generatedImage ? "Edit Image" : "Generate Image"}
                          >
                            {isGeneratingImage ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                          </button>
                      </div>
                      <p className="text-[10px] text-indigo-400 mt-1">
                          {generatedImage ? "Type a prompt to edit the image." : "Enter a prompt or use the default based on the answer."}
                      </p>
                   </div>

                   <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Category (Optional)</label>
                    <input
                      type="text"
                      value={newQCategory}
                      onChange={(e) => setNewQCategory(e.target.value)}
                      placeholder="e.g., Favorites"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                    />
                  </div>

                  <button
                    onClick={addQuestion}
                    disabled={!isFormValid}
                    className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-2 shadow-md"
                  >
                    <Save size={18} />
                    Save Question
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
                 <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">
                        Current Questions ({questions.length})
                    </h2>
                 </div>
                 <QuestionList questions={questions} onDelete={deleteQuestion} />
            </div>
          </div>
        )}

        {/* PLAY MODE */}
        {mode === 'play' && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
            
            {questions.length > 0 ? (
                <>
                    <div className="w-full flex justify-center px-4">
                        <Card 
                            question={questions[currentCardIndex]} 
                            isFlipped={isFlipped} 
                            onFlip={() => setIsFlipped(!isFlipped)} 
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button 
                            onClick={prevCard}
                            className="p-4 rounded-full bg-white shadow-md text-slate-600 hover:text-indigo-600 hover:shadow-lg transition-all"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        
                        <div className="text-slate-400 font-mono font-medium">
                            {currentCardIndex + 1} / {questions.length}
                        </div>

                        <button 
                            onClick={nextCard}
                            className="p-4 rounded-full bg-white shadow-md text-slate-600 hover:text-indigo-600 hover:shadow-lg transition-all"
                        >
                            <ArrowRight size={24} />
                        </button>
                    </div>
                </>
            ) : (
                <div className="text-center text-slate-400">
                    <p className="mb-4">No questions available!</p>
                    <button 
                        onClick={() => setMode('entry')}
                        className="text-indigo-600 font-bold hover:underline"
                    >
                        Go add some
                    </button>
                </div>
            )}
            
            {questions.length > 0 && (
                <button 
                    onClick={resetGame}
                    className="flex items-center gap-2 text-slate-400 hover:text-indigo-500 transition-colors text-sm mt-8"
                >
                    <RefreshCw size={14} />
                    Restart Quiz
                </button>
            )}

            {/* AI HOST OVERLAY */}
            <LiveHost 
                question={questions.length > 0 ? questions[currentCardIndex] : null} 
                isFlipped={isFlipped} 
            />
          </div>
        )}
      </main>
    </div>
  );
}