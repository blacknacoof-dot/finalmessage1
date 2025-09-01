
import React, { useState } from 'react';
import Dashboard from './views/Dashboard';
import Application from './views/Application';
import Landing from './views/Landing'; // Import the new Landing component
import Partners from './views/Partners';
import { DashboardIcon, ApplicationIcon } from './components/icons';
import type { User } from './types'; // Import User type

export type Language = 'en' | 'ko';
export type View = 'dashboard' | 'application';
export type PublicPage = 'landing' | 'partners';

// Mock user for login simulation
const mockUser: User = { name: 'Black Kim', email: 'black@example.com', plan: 'Free', subscription: null };

export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.log(error);
            return initialValue;
        }
    });

    const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.log(error);
        }
    };
    return [storedValue, setValue];
}


const LanguageSwitcher: React.FC<{ language: Language; setLanguage: (lang: Language) => void; className?: string }> = ({ language, setLanguage, className }) => (
    <div className={`flex items-center bg-slate-800 border border-slate-700 rounded-full p-1 text-sm font-semibold ${className}`}>
        <button onClick={() => setLanguage('en')} aria-pressed={language === 'en'} className={`px-3 py-1 rounded-full transition-colors ${language === 'en' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>EN</button>
        <button onClick={() => setLanguage('ko')} aria-pressed={language === 'ko'} className={`px-3 py-1 rounded-full transition-colors ${language === 'ko' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>KO</button>
    </div>
);

const ViewSwitcher: React.FC<{ view: View; setView: (view: View) => void; language: Language }> = ({ view, setView, language }) => {
    const tabs = [
        { id: 'dashboard', icon: <DashboardIcon />, text: language === 'ko' ? '대시보드' : 'Dashboard' },
        { id: 'application', icon: <ApplicationIcon />, text: language === 'ko' ? '애플리케이션' : 'Application' }
    ];

    return (
        <div className="flex items-center bg-slate-800 border border-slate-700 rounded-full p-1 text-sm font-semibold">
            {tabs.map(tab => (
                 <button 
                    key={tab.id}
                    onClick={() => setView(tab.id as View)} 
                    aria-pressed={view === tab.id} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${view === tab.id ? 'bg-sky-500 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
                >
                    {tab.icon}
                    <span>{tab.text}</span>
                </button>
            ))}
        </div>
    );
};


const App: React.FC = () => {
    const [language, setLanguage] = useLocalStorage<Language>('finalmessage_lang', 'ko');
    const [view, setView] = useLocalStorage<View>('finalmessage_view', 'application');
    const [user, setUser] = useLocalStorage<User | null>('finalmessage_user', null);
    const [publicPage, setPublicPage] = useLocalStorage<PublicPage>('finalmessage_public_page', 'landing');

    const handleLogin = () => {
        // When logging in, if no user exists, create one from mock.
        // If one exists (e.g. from previous session), use it.
        const existingUserRaw = window.localStorage.getItem('finalmessage_user');
        if (existingUserRaw && existingUserRaw !== 'null') {
            try {
                const existingUser = JSON.parse(existingUserRaw);
                 // Ensure the user object has the latest structure
                if (!('subscription' in existingUser)) {
                    existingUser.subscription = null;
                }
                setUser(existingUser);
            } catch {
                setUser(mockUser);
            }
        } else {
            setUser(mockUser);
        }
    };

    const handleLogout = () => {
        // Clear all app-related local storage
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('finalmessage_')) {
                localStorage.removeItem(key);
            }
        });
        // Set user to null to show landing page
        setUser(null);
        setPublicPage('landing');
    };
    
    const renderApplicationView = () => {
        if (user) {
            // Pass setUser to Application to handle plan upgrades
            return <Application language={language} user={user} setUser={setUser} onLogout={handleLogout} />;
        }
        
        // Unauthenticated users
        switch(publicPage) {
            case 'partners':
                return <Partners language={language} setPage={setPublicPage} />;
            case 'landing':
            default:
                return <Landing language={language} onLogin={handleLogin} setPage={setPublicPage} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-gray-200 antialiased">
            {/* The header is only shown if the view is dashboard, or if the user is logged into the application */}
            {(view === 'dashboard' || (view === 'application' && user)) && (
                <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row items-center justify-between h-20 gap-4">
                            <div className="flex items-center gap-4">
                                <h1 className="text-2xl font-bold text-white">FinalMessage</h1>
                                <ViewSwitcher view={view} setView={setView} language={language} />
                            </div>
                            <LanguageSwitcher language={language} setLanguage={setLanguage} />
                        </div>
                    </div>
                </header>
            )}
            
            <main>
                {view === 'dashboard' && <Dashboard language={language} />}
                {view === 'application' && renderApplicationView()}
            </main>
        </div>
    );
};

export default App;
