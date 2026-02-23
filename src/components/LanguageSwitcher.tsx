import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Language } from '../i18n/translations';

const LANGUAGES: { code: Language; label: string; name: string }[] = [
    { code: 'ar', label: 'AR', name: 'العربية' },
    { code: 'bn', label: 'BN', name: 'বাংলা' },
    { code: 'de', label: 'DE', name: 'Deutsch' },
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'es', label: 'ES', name: 'Español' },
    { code: 'fr', label: 'FR', name: 'Français' },
    { code: 'hi', label: 'HI', name: 'हिन्दी' },
    { code: 'ja', label: 'JA', name: '日本語' },
    { code: 'pt', label: 'PT', name: 'Português' },
    { code: 'ru', label: 'RU', name: 'Русский' },
    { code: 'tr', label: 'TR', name: 'Türkçe' },
    { code: 'zh', label: 'ZH', name: '中文' },
];

export const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1 text-sm font-bold rounded-md transition-colors bg-slate-700 text-slate-300 hover:bg-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label="Language selector"
            >
                <span>{currentLang.label}</span>
                <svg className={`w-4 h-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>

            {isOpen && (
                <div className="absolute end-0 mt-2 w-36 bg-slate-800/30 backdrop-blur-xl rounded-md shadow-lg overflow-hidden ring-1 ring-black ring-opacity-5">
                    <ul className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {LANGUAGES.map((lang) => (
                            <li key={lang.code}>
                                <button
                                    onClick={() => {
                                        setLanguage(lang.code);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                                        language === lang.code
                                            ? 'bg-amber-500 text-slate-900'
                                            : 'text-slate-300 hover:bg-slate-600/70'
                                    }`}
                                    role="menuitem"
                                >
                                    {lang.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};