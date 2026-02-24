import React, { useState } from 'react';
import { QuizWorkspace } from './components/QuizWorkspace';
import { SolverWorkspace } from './components/SolverWorkspace';

function App() {
    const [mode, setMode] = useState<'quiz' | 'solver'>('quiz');

    return (
        <div className="bg-slate-900 text-slate-100 min-h-screen font-sans flex flex-col items-center p-4 sm:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <header className="relative text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-amber-400 px-16 sm:px-20">
                        Matchstick Puzzle
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg px-16 sm:px-20">
                        Drag 1 stick to fix the equation
                    </p>
                    
                    <div className="mt-6 flex justify-center gap-4">
                        <button 
                            onClick={() => setMode('quiz')}
                            className={`px-6 py-2 rounded-full font-medium transition ${mode === 'quiz' ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                        >
                            Quiz Mode
                        </button>
                        <button 
                            onClick={() => setMode('solver')}
                            className={`px-6 py-2 rounded-full font-medium transition ${mode === 'solver' ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                        >
                            Solver Mode
                        </button>
                    </div>
                </header>

                {mode === 'quiz' ? <QuizWorkspace /> : <SolverWorkspace />}
            </div>
        </div>
    );
}

export default App;