import React, { useState } from 'react';
import type { Language, PublicPage } from '../App';
import Footer from '../components/Footer';
import { data } from '../constants';

interface PartnersProps {
    language: Language;
    setPage: (page: PublicPage) => void;
}

const Partners: React.FC<PartnersProps> = ({ language, setPage }) => {
    const t = data[language].partnersPage;
    const [formState, setFormState] = useState({
        companyType: '',
        companyName: '',
        contactName: '',
        phone: '',
        mobile: '',
        email: '',
        inquiry: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(t.contactForm.successMessage);
        setFormState({
            companyType: '',
            companyName: '',
            contactName: '',
            phone: '',
            mobile: '',
            email: '',
            inquiry: ''
        });
    };


    return (
        <div className="bg-slate-900">
            {/* Header */}
            <header className="relative text-center py-24 sm:py-32 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-700/[0.05] [mask-image:linear-gradient(to_bottom,white_40%,transparent_90%)]"></div>
                <div className="absolute top-8 left-8">
                    <button onClick={() => setPage('landing')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors text-sm border-none">
                        &larr; {t.backToHome}
                    </button>
                </div>
                <div className="relative z-10">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
                        {t.title}
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg text-slate-300">
                        {t.subtitle}
                    </p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
                {/* Partners Section */}
                <section>
                    <div className="grid md:grid-cols-2 gap-8">
                        {t.partners.map((partner) => (
                            <div key={partner.type} className="bg-slate-800/50 p-8 rounded-xl border border-slate-700/50 flex flex-col transition-all duration-300 hover:border-sky-500/50 hover:bg-slate-800">
                                <div className="flex items-center gap-4 mb-4">
                                    {partner.icon}
                                    <h3 className="text-xl font-bold text-white">{partner.type}</h3>
                                </div>
                                <p className="text-slate-400 mb-6 flex-grow">{partner.description}</p>
                                
                                <div className="border-t border-slate-700 pt-4">
                                    <h4 className="font-semibold text-sm text-slate-200 mb-2">Key Benefits:</h4>
                                    <ul className="space-y-2">
                                        {partner.benefits.map(benefit => (
                                            <li key={benefit} className="flex items-start">
                                                <svg className="w-4 h-4 text-sky-400 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                                <span className="text-slate-300 text-sm">{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contact-form" className="py-16">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-white">{t.contactForm.title}</h2>
                        <p className="mt-4 text-lg text-slate-300">{t.contactForm.subtitle}</p>
                    </div>
                    <form onSubmit={handleSubmit} className="mt-12 max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label htmlFor="companyType" className="block text-sm font-medium text-slate-300 mb-1">{t.contactForm.fields.companyType.label}</label>
                            <select id="companyType" name="companyType" value={formState.companyType} onChange={handleInputChange} required className={`block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 ${!formState.companyType ? 'text-slate-400' : 'text-white'}`}>
                                <option value="" disabled>{t.contactForm.fields.companyType.placeholder}</option>
                                {t.contactForm.fields.companyType.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-slate-300 mb-1">{t.contactForm.fields.companyName.label}</label>
                            <input type="text" id="companyName" name="companyName" value={formState.companyName} onChange={handleInputChange} placeholder={t.contactForm.fields.companyName.placeholder} required className="block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
                        </div>

                        <div>
                            <label htmlFor="contactName" className="block text-sm font-medium text-slate-300 mb-1">{t.contactForm.fields.contactName.label}</label>
                            <input type="text" id="contactName" name="contactName" value={formState.contactName} onChange={handleInputChange} placeholder={t.contactForm.fields.contactName.placeholder} required className="block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
                        </div>
                        
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1">{t.contactForm.fields.phone.label}</label>
                            <input type="tel" id="phone" name="phone" value={formState.phone} onChange={handleInputChange} placeholder={t.contactForm.fields.phone.placeholder} className="block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
                        </div>
                        
                        <div>
                            <label htmlFor="mobile" className="block text-sm font-medium text-slate-300 mb-1">{t.contactForm.fields.mobile.label}</label>
                            <input type="tel" id="mobile" name="mobile" value={formState.mobile} onChange={handleInputChange} placeholder={t.contactForm.fields.mobile.placeholder} required className="block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">{t.contactForm.fields.email.label}</label>
                            <input type="email" id="email" name="email" value={formState.email} onChange={handleInputChange} placeholder={t.contactForm.fields.email.placeholder} required className="block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="inquiry" className="block text-sm font-medium text-slate-300 mb-1">{t.contactForm.fields.inquiry.label}</label>
                            <textarea id="inquiry" name="inquiry" value={formState.inquiry} onChange={handleInputChange} placeholder={t.contactForm.fields.inquiry.placeholder} required rows={5} className="block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 resize-none"></textarea>
                        </div>

                        <div className="md:col-span-2 text-right">
                            <button type="submit" className="inline-block px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-lg transition-transform transform hover:scale-105 border-none">
                                {t.contactForm.submitButton}
                            </button>
                        </div>
                    </form>
                </section>
            </main>

            <Footer language={language} setPage={setPage} />
        </div>
    );
};

export default Partners;
