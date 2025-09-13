
import React from 'react';
import type { Language, PublicPage } from '../App';
import { VaultIcon, SparklesIcon, BlockchainIcon, ChatBubbleLeftRightIcon } from '../components/icons';
import Footer from '../components/Footer';

interface LandingProps {
    language: Language;
    onLogin: () => void;
    setPage: (page: PublicPage) => void;
}

const translations = {
    en: {
        title: "Your Digital Legacy, Delivered Securely.",
        subtitle: "FinalMessage ensures your final words, precious assets, and vital information are passed on to your loved ones, exactly as you intended.",
        getStarted: "Get Started for Free",
        login: "Log In",
        featuresTitle: "A Complete Solution for Your Digital Estate",
        feature1Title: "Digital Secure Vault",
        feature1Desc: "Store everything from personal letters and photos to bank account details and cryptocurrency keys with AES-256 encryption.",
        feature2Title: "AI-Powered Messages",
        feature2Desc: "Can't find the right words? Our AI helps you craft beautiful, heartfelt messages for your final testament.",
        feature3Title: "Blockchain Verified Delivery",
        feature3Desc: "We use blockchain technology to guarantee that your legacy is delivered tamper-proof to your designated verifiers.",
        howItWorksTitle: "Simple, Secure, and Reliable",
        step1Title: "Secure",
        step1Desc: "Place your messages, files, and asset information into your encrypted vault.",
        step2Title: "Designate",
        step2Desc: "Choose trusted verifiers who will be responsible for confirming your passing.",
        step3Title: "Deliver",
        step3Desc: "Upon verification, your vault is automatically and securely delivered.",
        emotionalTitle: "Life is unpredictable. Your final message shouldn't be.",
        emotionalBody: "We often wait for the 'right moment' to say what truly matters. But life doesn't always grant us that luxury. Preparing your final message isn't about dwelling on the end; it's about cherishing the present. It's a final, profound act of love—providing clarity, comfort, and peace of mind for those you'll one day leave behind. Ensure your legacy is one of love, not of loose ends.",
    },
    ko: {
        title: "디지털 유산, 가장 안전한 방법으로 전달하세요.",
        subtitle: "FinalMessage는 당신의 마지막 말, 소중한 자산, 그리고 중요한 정보가 당신의 의도대로 사랑하는 사람들에게 정확히 전달되도록 보장합니다.",
        getStarted: "무료로 시작하기",
        login: "로그인",
        featuresTitle: "당신의 디지털 자산을 위한 완벽한 솔루션",
        feature1Title: "디지털 안심 금고",
        feature1Desc: "개인 편지와 사진부터 은행 계좌 정보, 암호화폐 키까지 모든 것을 AES-256 암호화로 안전하게 보관하세요.",
        feature2Title: "AI 기반 메시지 작성",
        feature2Desc: "적절한 단어를 찾기 힘드신가요? 저희 AI가 당신의 마지막 유언을 위해 아름답고 진심 어린 메시지를 작성하도록 도와드립니다.",
        feature3Title: "블록체인 검증 전달",
        feature3Desc: "블록체인 기술을 사용하여 당신의 유산이 지정된 확인자에게 변조 없이 안전하게 전달되는 것을 보장합니다.",
        howItWorksTitle: "간단하고, 안전하며, 신뢰할 수 있습니다",
        step1Title: "보관",
        step1Desc: "당신의 메시지, 파일, 자산 정보를 암호화된 금고에 보관하세요.",
        step2Title: "지정",
        step2Desc: "당신의 부고를 확인할 책임이 있는 신뢰할 수 있는 확인자를 선택하세요.",
        step3Title: "전달",
        step3Desc: "확인이 완료되면, 당신의 금고는 자동으로 안전하게 전달됩니다.",
        emotionalTitle: "삶은 예측할 수 없지만, 당신의 마지막은 그렇지 않아야 합니다.",
        emotionalBody: "우리는 가장 중요한 말을 전하기 위해 '완벽한 순간'을 기다리곤 합니다. 하지만 삶이 항상 그럴 여유를 주는 것은 아닙니다. 마지막 메시지를 준비하는 것은 끝을 생각하는 것이 아니라, 현재를 소중히 여기는 것입니다. 이는 당신이 언젠가 떠나게 될 사람들에게 명확함, 위안, 그리고 마음의 평화를 주는 마지막 사랑의 표현입니다. 당신의 유산이 미처 정리하지 못한 일들이 아닌, 사랑으로 기억되도록 하세요.",
    }
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
        <div className="flex items-center gap-4 mb-3">
            {icon}
            <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <p className="text-slate-400">{children}</p>
    </div>
);

const HowItWorksStep: React.FC<{ number: string; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
    <div className="text-center md:text-left">
        <div className="flex justify-center md:justify-start items-center gap-4 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700 border border-slate-600 text-sky-400 font-bold text-lg">{number}</div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <p className="text-slate-400 max-w-xs mx-auto md:mx-0 md:pl-14">{children}</p>
    </div>
);


const Landing: React.FC<LandingProps> = ({ language, onLogin, setPage }) => {
    const t = translations[language];

    return (
        <div className="bg-slate-900">
            {/* Hero Section */}
            <header className="relative text-center py-24 sm:py-32 px-4 overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-700/[0.05] [mask-image:linear-gradient(to_bottom,white_40%,transparent_90%)]"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
                        {t.title}
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-300">
                        {t.subtitle}
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/login.html" className="px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-lg transition-transform transform hover:scale-105 border-none text-center no-underline">
                            {t.getStarted}
                        </a>
                        <a href="/login.html" className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors border-none text-center no-underline">
                            {t.login}
                        </a>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
                {/* Features Section */}
                <section>
                    <h2 className="text-3xl font-bold text-center text-white mb-12">{t.featuresTitle}</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard icon={<VaultIcon className="w-8 h-8 text-cyan-400"/>} title={t.feature1Title}>
                            {t.feature1Desc}
                        </FeatureCard>
                        <FeatureCard icon={<SparklesIcon className="w-8 h-8 text-purple-400"/>} title={t.feature2Title}>
                            {t.feature2Desc}
                        </FeatureCard>
                        <FeatureCard icon={<BlockchainIcon className="w-8 h-8 text-amber-400"/>} title={t.feature3Title}>
                            {t.feature3Desc}
                        </FeatureCard>
                    </div>
                </section>
                
                {/* How It Works Section */}
                <section>
                    <h2 className="text-3xl font-bold text-center text-white mb-16">{t.howItWorksTitle}</h2>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12 md:gap-8">
                        <HowItWorksStep number="1" title={t.step1Title}>{t.step1Desc}</HowItWorksStep>
                        <div className="hidden md:block flex-1 border-t-2 border-dashed border-slate-700"></div>
                        <HowItWorksStep number="2" title={t.step2Title}>{t.step2Desc}</HowItWorksStep>
                        <div className="hidden md:block flex-1 border-t-2 border-dashed border-slate-700"></div>
                        <HowItWorksStep number="3" title={t.step3Title}>{t.step3Desc}</HowItWorksStep>
                    </div>
                </section>

                {/* Emotional Message Section */}
                <section className="text-center py-16">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto text-sky-400" />
                    <h2 className="mt-6 text-3xl font-bold text-white max-w-2xl mx-auto">{t.emotionalTitle}</h2>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-slate-300">
                        {t.emotionalBody}
                    </p>
                </section>

            </main>
            <Footer language={language} setPage={setPage} />
        </div>
    );
};

export default Landing;
