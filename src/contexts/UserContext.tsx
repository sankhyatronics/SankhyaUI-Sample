import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'dk' | 'de';
interface UserContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    theme: string;
    setTheme: (theme: string) => void;
    toggleTheme: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Language State
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('app-language');
        return (saved as Language) || 'en';
    });

    // Theme State
    const [theme, setThemeState] = useState<string>(() => {
        const saved = localStorage.getItem('app-theme');
        return (saved as string) || 'light';
    });

    // Persist Language
    useEffect(() => {
        localStorage.setItem('app-language', language);
    }, [language]);

    // Persist and Apply Theme
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('app-theme', theme);
    }, [theme]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const setTheme = (newTheme: string) => {
        setThemeState(newTheme);
    };

    const toggleTheme = () => {
        // Updated theme list: 4 light-based, 4 dark-based
        const themes = [
            'light', 'dark', 'lavender', 'slate', 'fire', 'jungle', 'ocean', 'desert'
        ];
        const currentThemeIndex = themes.indexOf(theme || 'light');
        const newTheme = themes[(currentThemeIndex + 1) % themes.length];
        setThemeState(newTheme);
    };

    return (
        <UserContext.Provider value={{ language, setLanguage, theme, setTheme, toggleTheme }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
