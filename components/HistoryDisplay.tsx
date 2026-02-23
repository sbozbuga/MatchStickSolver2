import React, { useState } from 'react';
import type { HistoryEntry } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface HistoryDisplayProps {
    history: HistoryEntry[];
    onRevisit: (equation: string) => void;
}

export const HistoryDisplay: React.FC<HistoryDisplayProps> = ({ history, onRevisit }) => {
    const { t } = useLanguage();
    const [isCollapsed, setIsCollapsed] = useState(true);

    const getSolutionCountText = (count: number) => {
        if (count === 1) {
            return t('history.solution_one');
        }
        return t('history.solution_other').replace('{count}', String(count));
    }

    return (
        <div className="mt-8 pt-6 border-t border-slate-700">
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full flex items-center justify-center text-xl font-semibold text-white mb-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-md"
                aria-expanded={!isCollapsed}
                aria-controls="history-content"
            >
                <h2 className="group-hover:text-amber-400 transition-colors">
                    {t('history.title')}
                </h2>
                <span className={`ml-3 text-sm transform transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-90'}`}>
                    ▶
                </span>
            </button>

            {!isCollapsed && (
                <div id="history-content" className="space-y-2 max-h-60 overflow-y-auto px-2">
                    {history.length === 0 ? (
                        <p className="text-gray-500 text-center italic py-4">{t('history.empty')}</p>
                    ) : (
                        <ul className="divide-y divide-slate-800">
                            {history.map(entry => (
                                <li key={entry.id} className="py-2">
                                    <button
                                        onClick={() => onRevisit(entry.equation)}
                                        className="w-full flex justify-between items-center text-left p-2 rounded-md hover:bg-slate-700/50 focus:outline-none focus-visible:bg-slate-700/50 focus-visible:ring-2 focus-visible:ring-amber-500"
                                        aria-label={`${t('history.revisit')} ${entry.equation}`}
                                    >
                                        <span className="font-mono text-lg text-slate-300">{entry.equation}</span>
                                        <span className="text-sm font-semibold px-2 py-1 rounded-full bg-slate-600 text-amber-300">
                                            {getSolutionCountText(entry.solutions.length)}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};
