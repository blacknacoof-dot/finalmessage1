
import React from 'react';
import type { Language, PublicPage } from '../App';

interface FooterProps {
    language: Language;
    setPage?: (page: PublicPage) => void;
}

const Footer: React.FC<FooterProps> = ({ language, setPage }) => {
    const t = {
        en: {
            description: "Securely pass on your digital legacy.",
            rights: "All rights reserved.",
            home: "Home",
            partners: "B2B Partners",
        },
        ko: {
            description: "당신의 디지털 유산을 안전하게 전달하세요.",
            rights: "모든 권리 보유.",
            home: "홈",
            partners: "B2B 파트너",
        }
    }[language];

    return (
        <footer className="bg-slate-800/50 border-t border-slate-700/50 mt-24">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-2xl font-bold text-white">FinalMessage</h2>
                <p className="mt-2 text-slate-400">{t.description}</p>
                
                {setPage && (
                    <nav className="flex justify-center gap-6 mt-6 text-sm font-medium">
                        <button onClick={() => setPage('landing')} className="text-slate-400 hover:text-sky-400 transition-colors">{t.home}</button>
                        <button onClick={() => setPage('partners')} className="text-slate-400 hover:text-sky-400 transition-colors">{t.partners}</button>
                    </nav>
                )}

                <p className="mt-8 text-sm text-slate-500">
                    &copy; {new Date().getFullYear()} FinalMessage. {t.rights}
                </p>
            </div>
        </footer>
    );
};

export default Footer;
