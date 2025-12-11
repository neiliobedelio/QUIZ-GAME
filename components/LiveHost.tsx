import React from 'react';
import { Mic, MicOff, Activity, AlertCircle, Volume2 } from 'lucide-react';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { Question } from '../types';

interface LiveHostProps {
    question: Question | null;
    isFlipped: boolean;
}

export const LiveHost: React.FC<LiveHostProps> = ({ question, isFlipped }) => {
    // System instruction defining the persona
    const instruction = `
    You are an enthusiastic, charismatic game show host for a birthday party quiz called "Know-It-All". 
    Your personality is high-energy, friendly, and slightly humorous.
    You are talking to a room full of friends and the birthday person.
    
    Your role is to:
    1. Hype up the crowd.
    2. When asked, read out questions dramatically.
    3. Make funny comments about how well (or poorly) the friends know the birthday person.
    4. Keep the vibes positive and celebratory.
    
    Do not be too long-winded. Keep responses punchy and fun.
    If you hear silence or background noise, just wait for a direct prompt like "Host, what do you think?" or "Read the question".
    `;

    const { connect, disconnect, sendText, isConnected, isSpeaking, error } = useGeminiLive({ systemInstruction: instruction });

    const handleReadCard = () => {
        if (!question) return;

        if (isFlipped) {
            sendText(`Announce the answer to the group with flair. The answer is: "${question.answer}"`);
        } else {
            const optionsText = question.options 
                ? question.options.map((opt, i) => `Option ${String.fromCharCode(65 + i)}: ${opt}`).join(', ')
                : '';
            
            sendText(`Read this question and the multiple choice options to the group dramatically. Question: "${question.text}". Options are: ${optionsText}. Ask them to guess which one it is.`);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            {error && (
                 <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 mb-2 animate-fade-in-up">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}
            
            <div className="flex items-center gap-2">
                {isConnected && question && (
                    <button
                        onClick={handleReadCard}
                        className="bg-white hover:bg-slate-50 text-indigo-600 p-4 rounded-full shadow-xl transition-all duration-300 ring-2 ring-indigo-100 hover:scale-105"
                        title={isFlipped ? "Read Answer" : "Read Question"}
                    >
                        <Volume2 size={24} />
                    </button>
                )}

                <button
                    onClick={isConnected ? disconnect : connect}
                    className={`
                        flex items-center gap-2 px-6 py-4 rounded-full shadow-2xl transition-all duration-300 font-bold text-white
                        ${isConnected 
                            ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-200' 
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 ring-4 ring-indigo-200'
                        }
                    `}
                >
                    {isConnected ? (
                        <>
                            <MicOff size={24} />
                            <span>Stop Host</span>
                        </>
                    ) : (
                        <>
                            <Mic size={24} />
                            <span>Enable AI Host</span>
                        </>
                    )}
                </button>
            </div>

            {isConnected && (
                <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-slate-200 flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-green-500 animate-ping' : 'bg-slate-300'}`} />
                    <span className="text-sm font-medium text-slate-600">
                        {isSpeaking ? 'Host is speaking...' : 'Host is listening...'}
                    </span>
                    {isSpeaking && <Activity className="text-indigo-500 animate-pulse" size={16} />}
                </div>
            )}
        </div>
    );
};