import { useState, useEffect } from 'react';
import type { HistoryEntry } from '../types';

export function useHistory() {
    const [history, setHistory] = useState<HistoryEntry[]>(() => {
        try {
            const savedHistory = localStorage.getItem('matchstickHistory');
            return savedHistory ? JSON.parse(savedHistory) : [];
        } catch (error) {
            console.error("Failed to load history from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('matchstickHistory', JSON.stringify(history));
        } catch (error) {
            console.error("Failed to save history to localStorage", error);
        }
    }, [history]);
    
    const addHistoryEntry = (newEntry: Omit<HistoryEntry, 'id'>) => {
         setHistory(prev => {
            // Avoid duplicate consecutive entries
            if (prev.length > 0 && prev[0].equation === newEntry.equation) {
                return prev;
            }
            const entryWithId: HistoryEntry = { ...newEntry, id: `${Date.now()}-${newEntry.equation}` };
            // Prepend new entry and limit history size to 20
            return [entryWithId, ...prev].slice(0, 20); 
        });
    };

    return { history, addHistoryEntry };
}
