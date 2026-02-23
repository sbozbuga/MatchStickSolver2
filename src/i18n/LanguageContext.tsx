import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import { translations, Language, TranslationKey } from './translations';

const RTL_LANGUAGES: Language[] = ['ar'];

// Detect browser language and set a supported default
const getInitialLanguage = (): Language => {
    const browserLang = navigator.language.split('-')[0];
    if (browserLang in translations) {
        return browserLang as Language;
    }
    return 'en';
};


interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: TranslationKey | string) => string;
    direction: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(getInitialLanguage());

    const t = useMemo(() => (key: TranslationKey | string): string => {
        const translationSet = translations[language] || translations.en;
        return (translationSet as any)[key] || (translations.en as any)[key] || key;
    }, [language]);

    // Fix: Explicitly type `direction` to prevent type widening to `string`.
    const direction: 'ltr' | 'rtl' = useMemo(() => (RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr'), [language]);

    const value = { language, setLanguage, t, direction };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
