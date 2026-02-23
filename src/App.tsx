import React, { useState, useEffect } from 'react';
import { useLanguage } from './i18n/LanguageContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { AudioToggler } from './components/AudioToggler';
import { HistoryDisplay } from './components/HistoryDisplay';
import { useHistory } from './hooks/useHistory';
import { PuzzleWorkspace } from './components/PuzzleWorkspace';

function App() {
    const { t, language, direction } = useLanguage();
    // The input state is kept here to coordinate between History and PuzzleWorkspace
    const [input, setInput] = useState('6+4=4');
    const { history, addHistoryEntry } = useHistory();
    
    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = direction;
    }, [language, direction]);

    const handleRevisitPuzzle = (revisitEquation: string) => {
        setInput(revisitEquation);
    };

    const handleSolveSuccess = (data: { equation: string, solutions: string[] }) => {
        addHistoryEntry(data);
    };

    return (
        <div className="bg-slate-900 text-slate-100 min-h-screen font-sans flex flex-col items-center p-4 sm:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <header className="relative text-center mb-8">
                    <div className="absolute top-0 end-0 z-20 flex items-center gap-2">
                        <AudioToggler />
                        <LanguageSwitcher />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-amber-400 px-16 sm:px-20">
                        {t('app.title')}
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg px-16 sm:px-20">
                        {t('app.subtitle')}
                    </p>
                </header>

                <PuzzleWorkspace
                    initialEquation={input}
                    onSolveSuccess={handleSolveSuccess}
                />
                
                <HistoryDisplay history={history} onRevisit={handleRevisitPuzzle} />
            </div>
        </div>
    );
}

export default App;