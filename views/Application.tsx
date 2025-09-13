
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useLocalStorage } from '../App';
import type { Language } from '../App';
import type { User, Verifier, MediaFile, Asset, AssetType, BankAccountAsset, CryptoWalletAsset, SecretNoteAsset, Notary, Beneficiary } from '../types';
import { MessageService } from '../services/messageService';
import { WalletManager } from '../services/walletManager';
import { MessageManager } from '../components/MessageManager';
import { messageAPI, Message } from '../services/api';
import { toast } from '../utils/notifications';
import { 
    maskAccountNumber, 
    maskCryptoAddress, 
    maskPassword, 
    maskSeedPhrase,
    parseHashtags,
    getSecurityLevel
} from '../utils/assetSecurity';
import {
    UserCircleIcon, LogoutIcon, PremiumIcon, MultimediaIcon,
    VaultIcon, PlusIcon, TrashIcon, UploadIcon,
    VideoCameraIcon, MicrophoneIcon, SparklesIcon, LockClosedIcon,
    KeyIcon, BanknotesIcon, DocumentTextIcon, HomeIcon, CheckCircleIcon, ArrowRightIcon,
    Cog6ToothIcon, LegalIcon, PaperAirplaneIcon, CreditCardIcon, PencilIcon, EyeIcon,
    CalendarIcon, ClockIcon, XMarkIcon
} from '../components/icons';

// --- MOCK DATA ---
const mockVerifiers: Verifier[] = [];
const mockMediaFiles: MediaFile[] = [];
const mockAssets: Asset[] = [
    {
        id: 'bank_1',
        type: 'BankAccount',
        name: '신한은행 주거래',
        tags: ['주계좌', '급여', '생활비'],
        importance: 'high',
        isLocked: true,
        password: 'bank1234!',
        recoveryEmail: 'recovery@example.com',
        maskedView: true,
        bankName: '신한은행',
        accountNumber: '110-123-456789',
        notes: '매월 급여 입금 계좌'
    },
    {
        id: 'crypto_1', 
        type: 'CryptoWallet',
        name: '비트코인 메인 지갑',
        tags: ['암호화폐', '투자', '장기보유'],
        importance: 'high',
        isLocked: true,
        password: 'crypto2024!',
        recoveryEmail: 'crypto@example.com',
        maskedView: true,
        cryptoName: 'Bitcoin',
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        seedPhrase: 'abandon ability able about above absent absorb abstract absurd abuse access accident'
    },
    {
        id: 'note_1',
        type: 'SecretNote',
        name: '가족 비밀번호 모음',
        tags: ['비밀번호', '가족', '중요'],
        importance: 'medium',
        isLocked: false,
        maskedView: false,
        content: '집 현관문: 1234\n금고 비밀번호: 9876\n와이파이: home123!'
    }
];
const mockNotary: Notary | null = null;
const mockSettings = {
    inactivityTrigger: {
        enabled: false,
        period: 90, // days
    }
};

type SubscriptionPlan = 'Monthly' | 'Annual' | 'Lifetime';

// --- TEXT CONSTANTS ---
const translations = {
    en: {
        // App Shell
        homeTab: 'Home',
        messageTab: 'Message',
        multimediaTab: 'Multimedia',
        assetsTab: 'Assets',
        successorsTab: 'Successors',
        notaryTab: 'Notary',
        settingsTab: 'Settings',
        logout: 'Logout',

        // Home View
        home: {
            welcome: 'Welcome back',
            subtitle: "Here's a summary of your digital legacy preparation.",
            progressTitle: 'Your Progress',
            progressMessage: 'Write your final message',
            progressMultimedia: 'Add a multimedia message',
            progressSuccessors: 'Add successors',
            progressAssets: 'Secure your digital assets',
            messageDesc: 'No message saved yet. Start writing your final words.',
            multimediaDesc: 'Record a video or your voice for your loved ones.',
            successorsDesc: 'Designate who will receive your message.',
            assetsDesc: 'Store bank accounts, crypto wallets, and more.',
            premiumTitle: 'Unlock Your Full Legacy',
            premiumDesc: 'Upgrade to Premium to store unlimited digital assets and multimedia messages.',
        },

        // Message View
        yourFinalMessage: 'Your Final Message',
        lastSaved: 'Last saved:',
        aiTemplateGallery: 'AI Template Gallery',
        aiTemplateFamily: 'For Family',
        aiTemplateReflection: 'Life Reflection',
        aiTemplateFinancial: 'Financial Advice',
        generating: 'Generating...',
        saveMessage: 'Save Message',
        
        // Multimedia View
        multimediaTitle: 'Multimedia Messages',
        multimediaSubtitle: 'Record or upload video and audio messages for your loved ones.',
        premiumFeature: 'Premium Feature',
        uploadFile: 'Upload File',
        recordVideo: 'Record Video',
        recordAudio: 'Record Audio',
        noMedia: 'No multimedia messages yet. Upload one to get started.',
        recordingAudio: 'Recording audio...',
        stopRecording: 'Stop Recording',
        
        // Assets View
        assetsTitle: 'Digital Assets',
        assetsSubtitle: 'Securely store important digital assets, financial info, and secrets.',
        addAsset: 'Add Asset',
        assetType: 'Asset Type',
        bankAccount: 'Bank Account',
        cryptoWallet: 'Crypto Wallet',
        secretNote: 'Secret Note',
        assetName: 'Asset Name (e.g., Main Savings)',
        bankName: 'Bank Name',
        accountNumber: 'Account Number',
        cryptoName: 'Cryptocurrency (e.g., Bitcoin)',
        walletAddress: 'Wallet Address',
        seedPhrase: 'Seed Phrase / Private Key',
        note: 'Note',
        secretContent: 'Secret Content',

        // Successors View
        successorsTitle: 'Message Successors',
        successorsSubtitle: 'These individuals will receive your message and assets after verification.',
        addSuccessor: 'Add Successor',
        noSuccessors: 'No successors added yet. Add one to get started.',
        
        // Notary View
        notaryTitle: 'Legal Notarization',
        notarySubtitle: 'Designate a legal professional to add official validity to the delivery process.',
        notaryIntroTitle: 'Why Designate a Notary?',
        notaryIntroDesc: 'Appointing a legal professional (like a lawyer or notary public) adds a layer of legal verification to the process. This ensures that the transfer of your legacy is executed smoothly, minimizing potential disputes among successors and reinforcing the validity of your final wishes.',
        startDesignation: 'Start Notary Designation',
        notaryDesignated: 'Designated Notary',
        status: 'Status',
        pending: 'Pending Acceptance',
        accepted: 'Designated',
        resendInvite: 'Resend Invitation',
        cancelDesignation: 'Cancel Designation',
        simulateAcceptance: 'Simulate Acceptance (Dev)',

        // Settings View
        settingsTitle: 'Settings',
        settingsSubtitle: 'Manage how your digital legacy is delivered.',
        inactivityTriggerTitle: 'Enable Inactivity Trigger',
        inactivityTriggerDesc: 'Automatically start the verification process if you are inactive for a set period.',
        inactivityPeriod: 'Inactivity Period',
        inactivityPeriodDesc: "If you don't log in or respond to our check-in emails for this duration, we will initiate the delivery process with your successors.",
        days: 'Days',
        lastCheckIn: 'Last successful check-in:',
        paymentManagement: 'Payment Management',
        yourCurrentPlan: 'Your Current Plan',
        freePlan: 'Free Plan',
        premiumPlan: 'Premium Plan',
        monthlyPlan: 'Monthly Plan',
        annualPlan: 'Annual Plan',
        lifetimePlan: 'Lifetime Plan',
        pricePerMonth: '$15 / month',
        pricePerYear: '$140 / year',
        priceLifetime: '$1,400',
        originalPriceYear: '$200',
        originalPriceLifetime: '$2,000',
        billedAnnually: 'Billed annually',
        billedOnce: 'Billed once',
        save30Percent: 'Save 30%!',
        choosePlan: 'Choose Plan',
        nextPayment: 'Next payment on',
        paymentMethod: 'Payment Method',
        changePlan: 'Change Plan',
        cancelSubscription: 'Cancel Subscription',
        paymentModalTitle: 'Complete Your Upgrade',
        paymentModalSubtitle: 'You are upgrading to the',
        creditCard: 'Credit Card',
        bankTransfer: 'Bank Transfer',
        cardNumber: 'Card Number',
        expiryDate: 'Expiry Date (MM/YY)',
        cvc: 'CVC',
        payNow: 'Pay Now',
        paymentSuccess: 'Payment Successful!',
        paymentSuccessDesc: 'You have successfully upgraded to the Premium plan.',
        lifetimeFeature1: 'Lifetime access, no extra costs',
        lifetimeFeature2: 'Dedicated Concierge Support',
        lifetimeFeature3: 'Highest-grade secure storage',
        lifetimeFeature4: 'Successor Onboarding Support',
        premiumFeatureAI: 'AI-powered message templates',
        premiumFeatureMultimedia: 'Unlimited multimedia messages',
        premiumFeatureAssets: 'Unlimited digital asset storage',
        premiumFeatureSuccessors: 'Designate successors',
        premiumFeatureNotary: 'Legal notarization feature',

        // Modals
        addSuccessorTitle: 'Add a New Successor',
        addAssetTitle: 'Add a New Asset',
        addNotaryTitle: 'Designate a Notary',
        nameLabel: 'Full Name',
        emailLabel: 'Email Address',
        phoneLabel: 'Phone Number (Optional)',
        phonePlaceholder: 'e.g., 010-1234-5678',
        addressLabel: 'Mailing Address (Optional)',
        addressPlaceholder: 'For registered mail as a last resort',
        relationshipLabel: 'Relationship',
        relationshipPlaceholder: 'Select a relationship',
        relationshipOptions: {
            spouse: 'Spouse',
            son: 'Son',
            daughter: 'Daughter',
            parent: 'Parent',
            sibling: 'Sibling',
            friend: 'Friend',
            lawyer: 'Lawyer',
            other: 'Other',
        },
        firmLabel: 'Law Firm / Office',
        licenseNumberLabel: 'License/Registration No. (Optional)',
        cancel: 'Cancel',
        save: 'Save',
        protectWithPassword: 'Protect with a password (optional)',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        passwordsDoNotMatch: 'Passwords do not match.',
        passwordEncryptionNote: 'Your password will be securely encrypted.',
        
        premiumModalTitle: 'Upgrade to Premium',
        premiumModalText: 'This feature is available for Premium users. Upgrade your plan to unlock.',
        premiumPlaceholderText: 'Upgrade to Premium to manage your digital assets.',
        noAssets: 'No assets stored yet. Add one to secure your digital legacy.',
        close: 'Close',
        upgradeNow: 'Upgrade Now',

        // AI Placeholder
        aiPlaceholder: `My Dearest Family,...`,
    },
    ko: {
        // App Shell
        homeTab: '홈',
        messageTab: '메시지',
        multimediaTab: '멀티미디어',
        assetsTab: '자산',
        successorsTab: '상속자',
        notaryTab: '공증',
        settingsTab: '설정',
        logout: '로그아웃',
        
        // Home View
        home: {
            welcome: '다시 오신 것을 환영합니다',
            subtitle: '디지털 유산 준비 현황을 요약해 보여드립니다.',
            progressTitle: '나의 진행 상태',
            progressMessage: '마지막 메시지 작성',
            progressMultimedia: '멀티미디어 메시지 추가',
            progressSuccessors: '상속자 추가',
            progressAssets: '디지털 자산 보관',
            messageDesc: '아직 저장된 메시지가 없습니다. 마지막 말을 작성해보세요.',
            multimediaDesc: '사랑하는 사람을 위해 영상이나 음성을 녹음하세요.',
            successorsDesc: '누가 메시지를 받을지 지정하세요.',
            assetsDesc: '은행 계좌, 암호화폐 지갑 등을 보관하세요.',
            premiumTitle: '전체 유산 잠금 해제',
            premiumDesc: '프리미엄으로 업그레이드하여 디지털 자산과 멀티미디어 메시지를 무제한으로 보관하세요.',
        },

        // Message View
        yourFinalMessage: '나의 마지막 메시지',
        lastSaved: '마지막 저장:',
        aiTemplateGallery: 'AI 템플릿 갤러리',
        aiTemplateFamily: '가족에게',
        aiTemplateReflection: '인생을 돌아보며',
        aiTemplateFinancial: '재정적 조언',
        generating: '생성 중...',
        saveMessage: '메시지 저장',
        
        // Multimedia View
        multimediaTitle: '멀티미디어 메시지',
        multimediaSubtitle: '사랑하는 사람들을 위해 비디오 및 오디오 메시지를 녹화하거나 업로드하세요.',
        premiumFeature: '프리미엄 기능',
        uploadFile: '파일 업로드',
        recordVideo: '비디오 녹화',
        recordAudio: '오디오 녹음',
        noMedia: '아직 멀티미디어 메시지가 없습니다. 시작하려면 업로드해주세요.',
        recordingAudio: '오디오 녹음 중...',
        stopRecording: '녹화 중지',

        // Assets View
        assetsTitle: '디지털 자산',
        assetsSubtitle: '중요한 디지털 자산, 금융 정보, 비밀을 안전하게 보관하세요.',
        addAsset: '자산 추가',
        assetType: '자산 유형',
        bankAccount: '은행 계좌',
        cryptoWallet: '암호화폐 지갑',
        secretNote: '비밀 노트',
        assetName: '자산 이름 (예: 주거래 통장)',
        bankName: '은행 이름',
        accountNumber: '계좌번호',
        cryptoName: '코인 이름 (예: 비트코인)',
        walletAddress: '지갑 주소',
        seedPhrase: '시드 구문 / 개인 키',
        note: '메모',
        secretContent: '비밀 내용',

        // Successors View
        successorsTitle: '메시지 상속자',
        successorsSubtitle: '이들은 사후 확인 절차를 거쳐 당신의 메시지와 자산을 전달받게 됩니다.',
        addSuccessor: '상속자 추가',
        noSuccessors: '아직 추가된 상속자가 없습니다. 시작하려면 추가해주세요.',

        // Notary View
        notaryTitle: '법적 공증',
        notarySubtitle: '전달 과정에 공신력을 더할 법률 전문가(변호사 등)를 지정합니다.',
        notaryIntroTitle: '왜 공증인을 지정해야 할까요?',
        notaryIntroDesc: '변호사나 법무사 등 법률 전문가를 지정하면 유산 전달 과정에 법적 검증 절차를 더할 수 있습니다. 이는 상속인 간의 잠재적 분쟁을 최소화하고, 당신의 마지막 의사가 효력을 갖도록 보강하는 역할을 합니다.',
        startDesignation: '공증인 지정 시작하기',
        notaryDesignated: '지정된 공증인',
        status: '상태',
        pending: '수락 대기 중',
        accepted: '지정 완료',
        resendInvite: '초대 다시 보내기',
        cancelDesignation: '지정 취소',
        simulateAcceptance: '수락 시뮬레이션 (개발용)',

        // Settings View
        settingsTitle: '설정',
        settingsSubtitle: '당신의 디지털 유산이 어떻게 전달될지 관리하세요.',
        inactivityTriggerTitle: '자동 비활성 감지 활성화',
        inactivityTriggerDesc: '설정된 기간 동안 활동이 없으면 자동으로 확인 절차를 시작합니다.',
        inactivityPeriod: '비활성 기간',
        inactivityPeriodDesc: '선택하신 기간 동안 로그인이나 저희의 확인 이메일에 응답이 없으면, 지정된 상속자에게 전달 절차를 자동으로 시작합니다.',
        days: '일',
        lastCheckIn: '마지막 활동 확인:',
        paymentManagement: '결제 관리',
        yourCurrentPlan: '나의 요금제',
        freePlan: '무료 플랜',
        premiumPlan: '프리미엄 플랜',
        monthlyPlan: '월간 요금제',
        annualPlan: '연간 요금제',
        lifetimePlan: '평생 요금제 (상호 이온nft)',
        pricePerMonth: '월 15,000원',
        pricePerYear: '연 140,000원',
        priceLifetime: '140만원',
        originalPriceYear: '200,000원',
        originalPriceLifetime: '200만원',
        billedAnnually: '연간 결제',
        billedOnce: '한 번 결제',
        save30Percent: '30% 할인!',
        choosePlan: '요금제 선택',
        nextPayment: '다음 결제일',
        paymentMethod: '결제 수단',
        changePlan: '요금제 변경',
        cancelSubscription: '구독 해지',
        paymentModalTitle: '업그레이드 완료하기',
        paymentModalSubtitle: '다음 플랜으로 업그레이드합니다:',
        creditCard: '카드 결제',
        bankTransfer: '계좌 이체',
        cardNumber: '카드 번호',
        expiryDate: '유효기간 (MM/YY)',
        cvc: 'CVC',
        payNow: '결제하기',
        paymentSuccess: '결제 성공!',
        paymentSuccessDesc: '프리미엄 플랜으로 성공적으로 업그레이드되었습니다.',
        lifetimeFeature1: '평생 이용, 추가 비용 없음',
        lifetimeFeature2: '전담 컨시어지 지원',
        lifetimeFeature3: '최고 등급 보안 스토리지',
        lifetimeFeature4: '상속인 온보딩 지원',
        premiumFeatureAI: 'AI 메시지 템플릿',
        premiumFeatureMultimedia: '무제한 멀티미디어 메시지',
        premiumFeatureAssets: '무제한 디지털 자산 저장',
        premiumFeatureSuccessors: '상속인 지정',
        premiumFeatureNotary: '법적 공증 기능',


        // Modals
        addSuccessorTitle: '새 상속자 추가',
        addAssetTitle: '새 자산 추가',
        addNotaryTitle: '공증인 지정',
        nameLabel: '이름',
        emailLabel: '이메일 주소',
        phoneLabel: '전화번호 (선택 사항)',
        phonePlaceholder: '예: 010-1234-5678',
        addressLabel: '우편 주소 (선택 사항)',
        addressPlaceholder: '최후의 수단으로 사용할 등기우편용 주소',
        relationshipLabel: '관계',
        relationshipPlaceholder: '관계를 선택하세요',
        relationshipOptions: {
            spouse: '배우자',
            son: '아들',
            daughter: '딸',
            parent: '부모',
            sibling: '형제/자매',
            friend: '친구',
            lawyer: '변호사',
            other: '기타',
        },
        firmLabel: '법무법인 / 사무소명',
        licenseNumberLabel: '자격/등록 번호 (선택 사항)',
        cancel: '취소',
        save: '저장',
        protectWithPassword: '비밀번호로 보호 (선택 사항)',
        password: '비밀번호',
        confirmPassword: '비밀번호 확인',
        passwordsDoNotMatch: '비밀번호가 일치하지 않습니다.',
        passwordEncryptionNote: '비밀번호는 안전하게 암호화되어 저장됩니다.',

        premiumModalTitle: '프리미엄으로 업그레이드',
        premiumModalText: '이 기능은 프리미엄 사용자만 이용할 수 있습니다. 플랜을 업그레이드하여 잠금을 해제하세요.',
        premiumPlaceholderText: '디지털 자산을 관리하려면 프리미엄으로 업그레이드하세요.',
        noAssets: '아직 보관된 자산이 없습니다. 디지털 유산을 안전하게 보관하려면 추가하세요.',
        close: '닫기',
        upgradeNow: '지금 업그레이드',

        // AI Placeholder
        aiPlaceholder: `가장 사랑하는 나의 가족에게,...`,
    }
};

// --- MODALS ---

const AddSuccessorModal: React.FC<{ onClose: () => void; onSave: (successor: Omit<Verifier, 'id'>) => void; t: typeof translations['en'] }> = ({ onClose, onSave, t }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [relationship, setRelationship] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, email, relationship, phone, address });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 max-h-[80vh] overflow-y-auto"><h3 className="text-lg font-bold text-white">{t.addSuccessorTitle}</h3><div className="mt-6 space-y-4">
                        <div><label htmlFor="name" className="block text-sm font-medium text-slate-300">{t.nameLabel}</label><input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500" /></div>
                        <div><label htmlFor="email-add" className="block text-sm font-medium text-slate-300">{t.emailLabel}</label><input id="email-add" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500" /></div>
                        <div><label htmlFor="phone-add" className="block text-sm font-medium text-slate-300">{t.phoneLabel}</label><input id="phone-add" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.phonePlaceholder} className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500" /></div>
                        <div><label htmlFor="address-add" className="block text-sm font-medium text-slate-300">{t.addressLabel}</label><textarea id="address-add" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t.addressPlaceholder} rows={2} className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500" /></div>
                        <div>
                            <label htmlFor="relationship" className="block text-sm font-medium text-slate-300">{t.relationshipLabel}</label>
                            <select id="relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} required className={`mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 ${!relationship ? 'text-slate-400' : 'text-white'}`}>
                                <option value="" disabled>{t.relationshipPlaceholder}</option>
                                {Object.values(t.relationshipOptions).map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    </div></div>
                    <div className="bg-slate-800/50 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-md transition-colors">{t.cancel}</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors">{t.save}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AddNotaryModal: React.FC<{ onClose: () => void; onSave: (notary: Omit<Notary, 'id' | 'status'>) => void; t: typeof translations['en'] }> = ({ onClose, onSave, t }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [firm, setFirm] = useState('');
    const [phone, setPhone] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, email, firm, phone, licenseNumber });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 max-h-[80vh] overflow-y-auto"><h3 className="text-lg font-bold text-white">{t.addNotaryTitle}</h3><div className="mt-6 space-y-4">
                        <div><label htmlFor="notary-name" className="block text-sm font-medium text-slate-300">{t.nameLabel}</label><input id="notary-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500" /></div>
                        <div><label htmlFor="notary-email" className="block text-sm font-medium text-slate-300">{t.emailLabel}</label><input id="notary-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500" /></div>
                        <div><label htmlFor="notary-phone" className="block text-sm font-medium text-slate-300">{t.phoneLabel}</label><input id="notary-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.phonePlaceholder} className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500" /></div>
                        <div><label htmlFor="notary-firm" className="block text-sm font-medium text-slate-300">{t.firmLabel}</label><input id="notary-firm" type="text" value={firm} onChange={(e) => setFirm(e.target.value)} required className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500" /></div>
                        <div><label htmlFor="notary-license" className="block text-sm font-medium text-slate-300">{t.licenseNumberLabel}</label><input id="notary-license" type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500" /></div>
                    </div></div>
                    <div className="bg-slate-800/50 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-md transition-colors">{t.cancel}</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors">{t.save}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PremiumModal: React.FC<{ onClose: () => void; onUpgrade: () => void; t: typeof translations['en'] }> = ({ onClose, onUpgrade, t }) => (
     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md text-center p-8">
            <div className="mx-auto bg-sky-500/20 text-sky-300 w-16 h-16 rounded-full flex items-center justify-center"><PremiumIcon className="w-8 h-8" /></div>
            <h3 className="text-xl font-bold text-white mt-6">{t.premiumModalTitle}</h3>
            <p className="text-slate-400 mt-2">{t.premiumModalText}</p>
            <div className="mt-8 flex gap-4">
                 <button onClick={onClose} className="w-full px-6 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-md transition-colors">{t.close}</button>
                 <button onClick={() => { onUpgrade(); onClose(); }} className="w-full px-6 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors">{t.upgradeNow}</button>
            </div>
        </div>
    </div>
);


const AddAssetModal: React.FC<{ onClose: () => void; onSave: (asset: Omit<Asset, 'id'>) => void; t: typeof translations['en'] }> = ({ onClose, onSave, t }) => {
    const [type, setType] = useState<AssetType>('BankAccount');
    const [name, setName] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [cryptoName, setCryptoName] = useState('');
    const [address, setAddress] = useState('');
    const [seedPhrase, setSeedPhrase] = useState('');
    const [content, setContent] = useState('');
    const [isPasswordProtected, setIsPasswordProtected] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (isPasswordProtected && password !== confirmPassword) {
            setError(t.passwordsDoNotMatch);
            return;
        }

        let newAsset: Omit<Asset, 'id'>;
        const commonData = { name, ...(isPasswordProtected && password && { password }) };

        // FIX: Create asset with a specific type first to avoid excess property errors on the union type.
        switch(type) {
            case 'BankAccount': {
                const bankAsset: Omit<BankAccountAsset, 'id'> = { type, ...commonData, bankName, accountNumber, notes };
                newAsset = bankAsset;
                break;
            }
            case 'CryptoWallet': {
                const cryptoAsset: Omit<CryptoWalletAsset, 'id'> = { type, ...commonData, cryptoName, address, seedPhrase };
                newAsset = cryptoAsset;
                break;
            }
            case 'SecretNote': {
                const secretAsset: Omit<SecretNoteAsset, 'id'> = { type, ...commonData, content };
                newAsset = secretAsset;
                break;
            }
        }
        onSave(newAsset);
    }
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 h-[500px] overflow-y-auto"><h3 className="text-lg font-bold text-white">{t.addAssetTitle}</h3><div className="mt-6 space-y-4">
                        <div><label htmlFor="asset-type" className="block text-sm font-medium text-slate-300">{t.assetType}</label><select id="asset-type" value={type} onChange={e => setType(e.target.value as AssetType)} className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"><option value="BankAccount">{t.bankAccount}</option><option value="CryptoWallet">{t.cryptoWallet}</option><option value="SecretNote">{t.secretNote}</option></select></div>
                        <div><label htmlFor="asset-name" className="block text-sm font-medium text-slate-300">{t.assetName}</label><input id="asset-name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500" /></div>
                        {type === 'BankAccount' && (<>
                            <div><label htmlFor="bank-name" className="block text-sm font-medium text-slate-300">{t.bankName}</label><input id="bank-name" type="text" value={bankName} onChange={e => setBankName(e.target.value)} required className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white" /></div>
                            <div><label htmlFor="account-number" className="block text-sm font-medium text-slate-300">{t.accountNumber}</label><input id="account-number" type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} required className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white" /></div>
                            <div><label htmlFor="bank-notes" className="block text-sm font-medium text-slate-300">{t.note}</label><textarea id="bank-notes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white" /></div>
                        </>)}
                        {type === 'CryptoWallet' && (<>
                            <div><label htmlFor="crypto-name" className="block text-sm font-medium text-slate-300">{t.cryptoName}</label><input id="crypto-name" type="text" value={cryptoName} onChange={e => setCryptoName(e.target.value)} required className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white" /></div>
                            <div><label htmlFor="wallet-address" className="block text-sm font-medium text-slate-300">{t.walletAddress}</label><input id="wallet-address" type="text" value={address} onChange={e => setAddress(e.target.value)} className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white" /></div>
                            <div><label htmlFor="seed-phrase" className="block text-sm font-medium text-slate-300">{t.seedPhrase}</label><textarea id="seed-phrase" value={seedPhrase} onChange={e => setSeedPhrase(e.target.value)} required rows={3} className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white" /></div>
                        </>)}
                        {type === 'SecretNote' && (
                            <div><label htmlFor="secret-content" className="block text-sm font-medium text-slate-300">{t.secretContent}</label><textarea id="secret-content" value={content} onChange={e => setContent(e.target.value)} required rows={4} className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white" /></div>
                        )}
                        <div className="border-t border-slate-700/50 pt-4 space-y-4">
                            <div>
                                <label htmlFor="password-protect" className="flex items-center gap-3 cursor-pointer">
                                    <input id="password-protect" type="checkbox" checked={isPasswordProtected} onChange={e => setIsPasswordProtected(e.target.checked)} className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-sky-600 focus:ring-sky-500" />
                                    <span className="text-sm font-medium text-slate-300">{t.protectWithPassword}</span>
                                </label>
                            </div>
                            {isPasswordProtected && (
                                <>
                                    <div>
                                        <label htmlFor="asset-password" className="block text-sm font-medium text-slate-300 mb-1">{t.password}</label>
                                        <input id="asset-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
                                    </div>
                                    <div>
                                        <label htmlFor="asset-confirm-password" className="block text-sm font-medium text-slate-300 mb-1">{t.confirmPassword}</label>
                                        <input id="asset-confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
                                    </div>
                                    <p className="text-xs text-slate-500">{t.passwordEncryptionNote}</p>
                                </>
                            )}
                            {error && <p className="text-sm text-rose-400 font-medium">{error}</p>}
                        </div>
                    </div></div>
                    <div className="bg-slate-800/50 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-md transition-colors">{t.cancel}</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors">{t.save}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}


const RecordingModal: React.FC<{
    type: 'video' | 'audio';
    onClose: () => void;
    onSave: (file: MediaFile) => void;
    t: typeof translations['en'];
}> = ({ type, onClose, onSave, t }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);

    // Timer effect
    useEffect(() => {
        let interval: number;
        if (isRecording) {
            interval = window.setInterval(() => {
                setDuration(d => d + 1);
            }, 1000);
        }
        return () => window.clearInterval(interval);
    }, [isRecording]);

    // Setup and teardown effect
    useEffect(() => {
        const startRecording = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: type === 'video',
                    audio: true,
                });
                mediaStreamRef.current = stream;

                if (videoRef.current && type === 'video') {
                    videoRef.current.srcObject = stream;
                }

                const recorder = new MediaRecorder(stream);
                mediaRecorderRef.current = recorder;

                recorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        recordedChunksRef.current.push(event.data);
                    }
                };

                recorder.onstop = () => {
                    const mimeType = type === 'video' ? 'video/webm' : 'audio/webm';
                    const blob = new Blob(recordedChunksRef.current, { type: mimeType });
                    const fileExtension = type === 'video' ? 'webm' : 'ogg';
                    const fileName = `recording-${new Date().toISOString()}.${fileExtension}`;
                    
                    const newFile: MediaFile = {
                        id: `m${Date.now()}`,
                        name: fileName,
                        type: type,
                        size: `${(blob.size / (1024 * 1024)).toFixed(2)} MB`,
                        date: new Date().toLocaleDateString(),
                    };
                    onSave(newFile);
                    recordedChunksRef.current = [];
                };

                recorder.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Error accessing media devices.", err);
                alert("Could not access camera/microphone. Please check permissions.");
                onClose(); // Close modal if permissions are denied
            }
        };

        startRecording();

        return () => { // Cleanup function
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [type, onSave, onClose]);

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        onClose();
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4">
                        {type === 'video' ? t.recordVideo : t.recordAudio}
                    </h3>
                    <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                        {type === 'video' ? (
                            <video ref={videoRef} autoPlay muted className="w-full h-full rounded-lg object-cover"></video>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <MicrophoneIcon className="w-24 h-24 text-slate-500" />
                                <p className="text-slate-400">{t.recordingAudio}</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                             <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                             <p className="font-mono text-red-400 font-semibold">{formatDuration(duration)}</p>
                         </div>
                        <button onClick={handleStopRecording} className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors">
                            {t.stopRecording}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PaymentModal: React.FC<{ 
    plan: SubscriptionPlan;
    onClose: () => void; 
    onSuccess: (planType: SubscriptionPlan, paymentDetails: User['subscription']) => void; 
    t: typeof translations['en']; 
}> = ({ plan, onClose, onSuccess, t }) => {
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card');
    
    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        const nextPaymentDate = new Date();
        if (plan === 'Annual') {
            nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
        } else if (plan === 'Monthly') {
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        }

        const newSubscription: User['subscription'] = {
            planType: plan,
            status: 'active',
            nextPaymentDate: plan === 'Lifetime' ? 'N/A' : nextPaymentDate.toLocaleDateString(),
            paymentMethod: {
                type: 'Card', // Simplified for prototype
                details: 'Visa **** 4242'
            }
        };
        onSuccess(plan, newSubscription);
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md">
                <form onSubmit={handlePayment}>
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-white">{t.paymentModalTitle}</h3>
                        <p className="text-sm text-slate-400 mt-1">{t.paymentModalSubtitle} <span className="font-semibold text-sky-400">{plan === 'Monthly' ? t.monthlyPlan : plan === 'Annual' ? t.annualPlan : t.lifetimePlan}</span>.</p>
                        
                        <div className="mt-6">
                            <div className="grid grid-cols-2 gap-2 bg-slate-700/50 p-1 rounded-lg">
                                <button type="button" onClick={() => setPaymentMethod('card')} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${paymentMethod === 'card' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>{t.creditCard}</button>
                                <button type="button" onClick={() => setPaymentMethod('transfer')} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${paymentMethod === 'transfer' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>{t.bankTransfer}</button>
                            </div>

                            {paymentMethod === 'card' ? (
                                <div className="mt-4 space-y-4">
                                    <div><label htmlFor="card-number" className="block text-sm font-medium text-slate-300">{t.cardNumber}</label><input id="card-number" type="text" placeholder="0000 0000 0000 0000" required className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white" /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label htmlFor="expiry" className="block text-sm font-medium text-slate-300">{t.expiryDate}</label><input id="expiry" type="text" placeholder="MM/YY" required className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white" /></div>
                                        <div><label htmlFor="cvc" className="block text-sm font-medium text-slate-300">{t.cvc}</label><input id="cvc" type="text" placeholder="123" required className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white" /></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 p-4 bg-slate-700/50 rounded-lg text-sm text-slate-300">
                                    <p>우리은행 1002-123-456789</p>
                                    <p>예금주: (주)파이널메시지</p>
                                    <p className="mt-2 text-xs text-slate-400">입금 확인 후 플랜이 활성화됩니다.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="bg-slate-800/50 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-md transition-colors">{t.cancel}</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors">{t.payNow}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- SCREENS & VIEWS ---


const HomeView: React.FC<{ user: User; setActiveTab: (tab: string) => void; t: typeof translations['en'] }> = ({ user, setActiveTab, t }) => {
    const [message] = useLocalStorage('finalmessage_message', '');
    const [successors] = useLocalStorage<Verifier[]>('finalmessage_verifiers', mockVerifiers);
    const [assets] = useLocalStorage<Asset[]>('finalmessage_assets', mockAssets);
    const [files] = useLocalStorage<MediaFile[]>('finalmessage_media', mockMediaFiles);

    const progressItems = [
        { id: 'message', label: t.home.progressMessage, completed: message.length > 10 },
        { id: 'multimedia', label: t.home.progressMultimedia, completed: user.plan === 'Premium' && files.length > 0 },
        { id: 'successors', label: t.home.progressSuccessors, completed: user.plan === 'Premium' && successors.length > 0 },
        { id: 'assets', label: t.home.progressAssets, completed: user.plan === 'Premium' && assets.length > 0 },
    ];

    const quickLinks = [
        { id: 'message', title: t.messageTab, description: message ? `${message.substring(0, 40)}...` : t.home.messageDesc, count: null, premium: false },
        { id: 'multimedia', title: t.multimediaTab, description: t.home.multimediaDesc, count: user.plan === 'Premium' ? files.length : null, premium: true },
        { id: 'successors', title: t.successorsTab, description: t.home.successorsDesc, count: user.plan === 'Premium' ? successors.length : null, premium: true },
        { id: 'assets', title: t.assetsTab, description: t.home.assetsDesc, count: user.plan === 'Premium' ? assets.length : null, premium: true },
    ];
    
    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-2">{t.home.welcome}, {user.name}!</h2>
            <p className="text-slate-400 mb-8">{t.home.subtitle}</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-slate-900/70 p-6 rounded-lg border border-slate-700">
                    <h3 className="font-semibold text-lg text-white mb-4">{t.home.progressTitle}</h3>
                    <ul className="space-y-3">
                        {progressItems.map(item => (
                            <li key={item.id} className="flex items-center gap-3">
                                <CheckCircleIcon className={`w-6 h-6 transition-colors ${item.completed ? 'text-green-400' : 'text-slate-600'}`} />
                                <span className={`transition-colors ${item.completed ? 'text-slate-300' : 'text-slate-500'}`}>{item.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="lg:col-span-2 space-y-4">
                    {quickLinks.map(link => (
                         <button key={link.id} onClick={() => setActiveTab(link.id)} className="w-full text-left bg-slate-900/70 p-4 rounded-lg border border-slate-700 hover:border-sky-500/50 hover:bg-slate-800/50 transition-all duration-200 group">
                             <div className="flex justify-between items-center">
                                 <div className="flex items-center gap-3">
                                     <h4 className="font-semibold text-white">{link.title}</h4>
                                     {link.premium && user.plan === 'Free' && <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">Premium</span>}
                                 </div>
                                 <div className="flex items-center gap-4">
                                     {link.count !== null && <span className="text-lg font-bold text-sky-400">{link.count}</span>}
                                     <ArrowRightIcon className="w-5 h-5 text-slate-500 group-hover:text-sky-400 transition-colors" />
                                 </div>
                             </div>
                             <p className="text-sm text-slate-400 mt-1">{link.description}</p>
                         </button>
                    ))}
                    {user.plan === 'Free' && (
                        <div className="bg-gradient-to-r from-sky-500/20 to-purple-500/20 p-4 rounded-lg border border-sky-500/50">
                             <h4 className="font-semibold text-white">{t.home.premiumTitle}</h4>
                             <p className="text-sm text-slate-300 mt-1">{t.home.premiumDesc}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const MessageView: React.FC<{ user: User, onUpgrade: () => void, language: Language, t: typeof translations['en'] }> = ({ user, onUpgrade, language, t }) => {
    const [message, setMessage] = useLocalStorage('finalmessage_message', '');
    const [lastSaved, setLastSaved] = useLocalStorage('finalmessage_lastSaved', '');
    const [generatingTemplate, setGeneratingTemplate] = useState<string | null>(null);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // 서비스 인스턴스
    const messageService = new MessageService();
    const walletManager = new WalletManager();
    
    const handleSave = async () => {
        if (!message.trim()) {
            alert('메시지를 입력해주세요.');
            return;
        }
        
        setSaving(true);
        try {
            console.log('🔄 메시지 저장 시작...');
            
            // 자동 지갑 설정 (사용자 모름)
            await walletManager.setupUserWallet(user.email);
            
            // 메시지 저장 (블록체인 포함)
            const result = await messageService.saveMessage(
                user.email,
                '나의 유산 메시지',
                message,
                true // 암호화 옵션
            );
            
            if (result.success) {
                setLastSaved(new Date().toLocaleString());
                console.log('✅ 메시지 저장 완료:', result.message);
                
                // 사용자 친화적 메시지 표시
                if (result.transactionHash) {
                    alert('메시지가 블록체인에 안전하게 저장되었습니다! 🔒');
                } else {
                    alert('메시지가 저장되었습니다! (블록체인 백업 진행 중...)');
                }
            } else {
                console.error('❌ 메시지 저장 실패:', result.message);
                alert('메시지 저장 중 오류가 발생했습니다: ' + result.message);
            }
        } catch (error: any) {
            console.error('메시지 저장 예외:', error);
            alert('메시지 저장 중 오류가 발생했습니다: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const aiTemplates = [
        { id: 'family', label: t.aiTemplateFamily, prompt: 'Write a heartfelt last message to a family, in the style of a loving parent, focusing on cherished memories and future hopes for them.' },
        { id: 'reflection', label: t.aiTemplateReflection, prompt: 'Write a reflective final message, looking back on a long and fulfilling life, mentioning key lessons learned and expressing gratitude.' },
        { id: 'financial', label: t.aiTemplateFinancial, prompt: 'Write a clear and practical final message that includes guidance on financial matters, distribution of assets, and practical advice for the future, while still maintaining a warm and caring tone.' },
    ];

    const handleGenerateAI = async (templateId: string, basePrompt: string) => {
        if (user.plan === 'Free') {
            setShowPremiumModal(true);
            return;
        }
        
        const languageInstruction = language === 'ko' 
            ? "Please write the entire response in Korean."
            : "Please write the entire response in English.";

        const fullPrompt = `${basePrompt} ${languageInstruction}`;


        setGeneratingTemplate(templateId);
        try {
            // FIX: Initialize with process.env.API_KEY per guidelines. Assume it's available.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: fullPrompt,
            });
            setMessage(response.text);
        } catch (error) {
            console.error("Error generating AI content:", error);
            setMessage(t.aiPlaceholder);
        } finally {
            setGeneratingTemplate(null);
            await handleSave();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold text-white">{t.yourFinalMessage}</h2>{lastSaved && <p className="text-sm text-slate-400">{t.lastSaved} {lastSaved}</p>}</div>
            <div className="bg-slate-900/70 rounded-md border border-slate-700"><textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t.aiPlaceholder.substring(0, 100) + '...'} className="w-full h-80 bg-transparent p-4 text-slate-300 placeholder-slate-500 focus:outline-none resize-none"/></div>
            <div className="mt-6 flex justify-between items-start">
                <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className={`px-4 py-2 ${saving ? 'bg-gray-600' : 'bg-sky-600 hover:bg-sky-700'} text-white font-semibold rounded-md transition-colors flex items-center gap-2`}
                >
                    {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                    {saving ? '저장 중...' : t.saveMessage}
                </button>
            
                <div className="text-right">
                    <h3 className="font-semibold text-slate-300 mb-2 flex items-center justify-end gap-2">
                        <SparklesIcon className="w-5 h-5 text-purple-400" />
                        {t.aiTemplateGallery}
                        {user.plan === 'Free' && <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">Premium</span>}
                    </h3>
                    <div className="flex gap-2 justify-end">
                        {aiTemplates.map(template => (
                             <button 
                                key={template.id} 
                                onClick={() => handleGenerateAI(template.id, template.prompt)}
                                disabled={!!generatingTemplate}
                                className="flex items-center justify-center gap-2 px-3 py-1.5 text-sm bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium rounded-md transition-colors disabled:bg-slate-800 disabled:cursor-not-allowed"
                             >
                                {generatingTemplate === template.id ? (
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : ( <SparklesIcon className="w-4 h-4" /> )}
                                <span>{generatingTemplate === template.id ? t.generating : template.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            {showPremiumModal && <PremiumModal onClose={() => setShowPremiumModal(false)} onUpgrade={onUpgrade} t={t} />}
        </div>
    );
};

const MultimediaView: React.FC<{ user: User, onUpgrade: () => void, t: typeof translations['en'] }> = ({ user, onUpgrade, t }) => {
    const [mediaFiles, setMediaFiles] = useLocalStorage<MediaFile[]>('finalmessage_media', mockMediaFiles);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [recordingType, setRecordingType] = useState<'video' | 'audio' | null>(null);
    const [isFormMode, setIsFormMode] = useState(false);
    const [currentMedia, setCurrentMedia] = useState<{ id?: string; title: string; type: 'video' | 'audio'; file?: File; recipients: string[]; deliveryDate: string; beneficiaries: Beneficiary[]; }>({
        title: '',
        type: 'video',
        recipients: [''],
        deliveryDate: '',
        beneficiaries: []
    });

    const handleAction = (action: () => void) => {
        if (user.plan === 'Free') {
            setShowPremiumModal(true);
        } else {
            action();
        }
    };
    
    const handleDelete = (id: string) => {
        setMediaFiles(files => files.filter(f => f.id !== id));
    };
    
    const handleEdit = (media: MediaFile) => {
        setCurrentMedia({
            id: media.id,
            title: media.name,
            type: media.type,
            recipients: [''],
            deliveryDate: '',
            beneficiaries: media.beneficiaries || []
        });
        setIsFormMode(true);
    };

    const handleAddNew = () => {
        setCurrentMedia({
            title: '',
            type: 'video',
            recipients: [''],
            deliveryDate: '',
            beneficiaries: []
        });
        setIsFormMode(true);
    };
    
    const handleSaveRecording = (file: MediaFile) => {
        setMediaFiles(files => [...files, file]);
        setRecordingType(null);
    };

    const handleSaveMedia = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentMedia.title.trim()) {
            toast.error('제목을 입력해주세요');
            return;
        }
        
        const mediaData: MediaFile = {
            id: currentMedia.id || `media_${Date.now()}`,
            name: currentMedia.title,
            type: currentMedia.type,
            size: '0 MB',
            date: new Date().toLocaleDateString(),
            beneficiaries: currentMedia.beneficiaries
        };

        if (currentMedia.id) {
            setMediaFiles(files => files.map(f => f.id === currentMedia.id ? mediaData : f));
        } else {
            setMediaFiles(files => [...files, mediaData]);
        }
        
        setIsFormMode(false);
        toast.success('멀티미디어가 저장되었습니다');
    };

    const handleCancel = () => {
        setIsFormMode(false);
        setCurrentMedia({
            title: '',
            type: 'video',
            recipients: [''],
            deliveryDate: '',
            beneficiaries: []
        });
    };

    const addRecipient = () => {
        setCurrentMedia(prev => ({
            ...prev,
            recipients: [...prev.recipients, '']
        }));
    };

    const updateRecipient = (index: number, value: string) => {
        setCurrentMedia(prev => ({
            ...prev,
            recipients: prev.recipients.map((r, i) => i === index ? value : r)
        }));
    };

    const removeRecipient = (index: number) => {
        if (currentMedia.recipients.length > 1) {
            setCurrentMedia(prev => ({
                ...prev,
                recipients: prev.recipients.filter((_, i) => i !== index)
            }));
        }
    };
    
    if (isFormMode) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white">
                            {currentMedia.id ? '멀티미디어 편집' : '새 멀티미디어 추가'}
                        </h3>
                        <button onClick={handleCancel} className="text-slate-400 hover:text-white">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSaveMedia} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                멀티미디어 제목
                            </label>
                            <input
                                type="text"
                                value={currentMedia.title}
                                onChange={(e) => setCurrentMedia(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="제목을 입력하세요..."
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                미디어 타입
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCurrentMedia(prev => ({ ...prev, type: 'video' }))}
                                    className={`flex items-center gap-2 p-3 rounded-lg border ${
                                        currentMedia.type === 'video'
                                            ? 'bg-sky-600/20 border-sky-500 text-sky-400'
                                            : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'
                                    }`}
                                >
                                    <VideoCameraIcon className="w-5 h-5" />
                                    비디오
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentMedia(prev => ({ ...prev, type: 'audio' }))}
                                    className={`flex items-center gap-2 p-3 rounded-lg border ${
                                        currentMedia.type === 'audio'
                                            ? 'bg-sky-600/20 border-sky-500 text-sky-400'
                                            : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'
                                    }`}
                                >
                                    <MicrophoneIcon className="w-5 h-5" />
                                    오디오
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                수신자 (이메일)
                            </label>
                            {currentMedia.recipients.map((recipient, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="email"
                                        value={recipient}
                                        onChange={(e) => updateRecipient(index, e.target.value)}
                                        placeholder="recipient@example.com"
                                        className="flex-1 bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                    />
                                    {currentMedia.recipients.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeRecipient(index)}
                                            className="px-3 py-2 text-slate-400 hover:text-rose-400 bg-slate-700/50 border border-slate-600 rounded-md"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addRecipient}
                                className="text-sm text-sky-400 hover:text-sky-300"
                            >
                                + 수신자 추가
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                전달 날짜
                            </label>
                            <input
                                type="datetime-local"
                                value={currentMedia.deliveryDate}
                                onChange={(e) => setCurrentMedia(prev => ({ ...prev, deliveryDate: e.target.value }))}
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-md transition-colors"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors"
                            >
                                저장
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
    
    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">{t.multimediaTitle}</h2>
                    <p className="text-slate-400 mt-1">{t.multimediaSubtitle}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                        새 미디어 추가
                    </button>
                </div>
            </div>

            {user.plan === 'Free' ? (
                <div className="text-center bg-slate-900/70 p-12 rounded-lg border-2 border-dashed border-slate-700">
                    <MultimediaIcon className="w-12 h-12 mx-auto text-slate-500"/>
                    <h3 className="mt-4 text-lg font-semibold text-white">{t.premiumFeature}</h3>
                    <p className="text-slate-400 mt-1">{t.premiumModalText}</p>
                    <button onClick={() => setShowPremiumModal(true)} className="mt-6 px-5 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors">{t.upgradeNow}</button>
                </div>
            ) : mediaFiles.length === 0 ? (
                <div className="text-center bg-slate-900/70 p-12 rounded-lg border-2 border-dashed border-slate-700">
                    <MultimediaIcon className="w-12 h-12 mx-auto text-slate-500"/>
                    <h3 className="mt-4 text-lg font-semibold text-white">{t.noMedia}</h3>
                </div>
            ) : (
                <div className="space-y-4">
                    {mediaFiles.map(file => (
                        <div key={file.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-700 rounded-md">
                                        {file.type === 'video' ? <VideoCameraIcon className="w-6 h-6 text-sky-400"/> : <MicrophoneIcon className="w-6 h-6 text-sky-400"/>}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">{file.name}</p>
                                        <p className="text-xs text-slate-400">{file.size} &middot; {file.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEdit(file)}
                                        className="p-2 text-slate-400 hover:text-sky-400 rounded-md transition-colors"
                                        title="편집"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(file.id)}
                                        className="p-2 text-slate-400 hover:text-rose-400 rounded-md transition-colors"
                                        title="삭제"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {showPremiumModal && <PremiumModal onClose={() => setShowPremiumModal(false)} onUpgrade={onUpgrade} t={t} />}
            {recordingType && <RecordingModal type={recordingType} onClose={() => setRecordingType(null)} onSave={handleSaveRecording} t={t} />}
        </div>
    );
};

const AssetsView: React.FC<{ user: User, onUpgrade: () => void, t: typeof translations['en'] }> = ({ user, onUpgrade, t }) => {
    const [assets, setAssets] = useLocalStorage<Asset[]>('finalmessage_assets', mockAssets);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    const handleSave = (newAsset: Omit<Asset, 'id'>) => {
        // FIX: Add type assertion as TypeScript fails to infer the correct discriminated union type after spreading.
        const fullAsset = { ...newAsset, id: `a${Date.now()}` } as Asset;
        setAssets(prev => [...prev, fullAsset]);
        setIsAddModalOpen(false);
    };
    
    const handleDelete = (id: string) => {
        setAssets(assets => assets.filter(a => a.id !== id));
        setShowDeleteConfirm(null);
    };
    
    const handleView = (asset: Asset) => {
        setViewingAsset(asset);
    };
    
    const handleEdit = (asset: Asset) => {
        setEditingAsset(asset);
    };
    
    const handleEditSave = (updatedAsset: Asset) => {
        setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
        setEditingAsset(null);
    };
    
    const getAssetIcon = (type: AssetType) => {
        switch (type) {
            case 'BankAccount': return <BanknotesIcon className="w-6 h-6 text-green-400"/>;
            case 'CryptoWallet': return <KeyIcon className="w-6 h-6 text-amber-400"/>;
            case 'SecretNote': return <DocumentTextIcon className="w-6 h-6 text-purple-400"/>;
        }
    };
    
    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">{t.assetsTitle}</h2>
                    <p className="text-slate-400 mt-1">{t.assetsSubtitle}</p>
                </div>
                <button onClick={() => user.plan === 'Premium' ? setIsAddModalOpen(true) : setShowPremiumModal(true)} className="flex items-center gap-2 px-3 py-2 text-sm bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md transition-colors"><PlusIcon className="w-5 h-5"/>{t.addAsset}</button>
            </div>
            
            {user.plan === 'Free' ? (
                <div className="text-center bg-slate-900/70 p-12 rounded-lg border-2 border-dashed border-slate-700">
                    <VaultIcon className="w-12 h-12 mx-auto text-slate-500"/>
                    <h3 className="mt-4 text-lg font-semibold text-white">{t.premiumPlaceholderText}</h3>
                    <p className="text-slate-400 mt-1">{t.premiumModalText}</p>
                    <button onClick={() => setShowPremiumModal(true)} className="mt-6 px-5 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors">{t.upgradeNow}</button>
                </div>
            ) : assets.length === 0 ? (
                 <div className="text-center bg-slate-900/70 p-12 rounded-lg border-2 border-dashed border-slate-700">
                    <VaultIcon className="w-12 h-12 mx-auto text-slate-500"/>
                    <h3 className="mt-4 text-lg font-semibold text-white">{t.noAssets}</h3>
                </div>
            ) : (
                <div className="space-y-4">
                    {assets.map(asset => {
                        try {
                            const security = getSecurityLevel(asset.importance || 'low');
                            const parsedTags = parseHashtags(asset.tags || []);
                        
                        return (
                            <div key={asset.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="p-2 bg-slate-700 rounded-md flex-shrink-0">
                                            {getAssetIcon(asset.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-white truncate">{asset.name}</h3>
                                                {asset.isLocked && <LockClosedIcon className="w-4 h-4 text-amber-400" title="잠금됨"/>}
                                                <div className={`px-2 py-0.5 text-xs font-medium rounded-full ${security?.color === 'text-red-400' ? 'bg-red-500/20 text-red-400' : security?.color === 'text-amber-400' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                                                    {asset.importance === 'high' ? '높음' : asset.importance === 'medium' ? '중간' : '낮음'}
                                                </div>
                                            </div>

                                            {/* 해시태그 */}
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {parsedTags.map((tagObj, idx) => (
                                                    <span key={idx} className={`px-2 py-0.5 text-xs font-medium rounded-full ${tagObj.color}`}>
                                                        #{tagObj.tag}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* 자산별 마스킹된 정보 */}
                                            <div className="space-y-1 text-sm">
                                                {asset.type === 'BankAccount' && (
                                                    <>
                                                        <div className="text-slate-300">
                                                            <span className="text-slate-500">은행:</span> {asset.bankName}
                                                        </div>
                                                        <div className="text-slate-300">
                                                            <span className="text-slate-500">계좌:</span> {asset.maskedView ? maskAccountNumber(asset.accountNumber).masked : asset.accountNumber}
                                                        </div>
                                                        {asset.password && (
                                                            <div className="text-slate-300">
                                                                <span className="text-slate-500">비밀번호:</span> {maskPassword(asset.password).masked}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                                
                                                {asset.type === 'CryptoWallet' && (
                                                    <>
                                                        <div className="text-slate-300">
                                                            <span className="text-slate-500">코인:</span> {asset.cryptoName}
                                                        </div>
                                                        <div className="text-slate-300 font-mono text-xs">
                                                            <span className="text-slate-500">주소:</span> {asset.maskedView ? maskCryptoAddress(asset.address).masked : asset.address}
                                                        </div>
                                                        <div className="text-slate-300">
                                                            <span className="text-slate-500">시드:</span> {maskSeedPhrase(asset.seedPhrase).masked}
                                                        </div>
                                                        {asset.password && (
                                                            <div className="text-slate-300">
                                                                <span className="text-slate-500">비밀번호:</span> {maskPassword(asset.password).masked}
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                {asset.type === 'SecretNote' && (
                                                    <div className="text-slate-300">
                                                        <span className="text-slate-500">내용:</span> {asset.content.substring(0, 50)}...
                                                    </div>
                                                )}
                                            </div>

                                            {/* 복구 이메일 */}
                                            {asset.recoveryEmail && (
                                                <div className="mt-2 text-xs text-slate-400">
                                                    <span className="text-slate-500">복구:</span> {asset.recoveryEmail}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleView(asset)}
                                            className="p-1.5 text-slate-400 hover:text-sky-400 rounded-md transition-colors"
                                            title="보기"
                                        >
                                            <EyeIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(asset)}
                                            className="p-1.5 text-slate-400 hover:text-blue-400 rounded-md transition-colors"
                                            title="편집"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(asset.id)}
                                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md transition-colors"
                                            title="삭제"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                        } catch (error) {
                            console.error('Asset render error:', error);
                            return (
                                <div key={asset.id} className="bg-red-900/20 p-4 rounded-lg border border-red-500/20">
                                    <p className="text-red-400">자산을 표시하는 중 오류가 발생했습니다: {asset.name}</p>
                                </div>
                            );
                        }
                    })}
                </div>
            )}

            {isAddModalOpen && <AddAssetModal onClose={() => setIsAddModalOpen(false)} onSave={handleSave} t={t} />}
            {showPremiumModal && <PremiumModal onClose={() => setShowPremiumModal(false)} onUpgrade={onUpgrade} t={t} />}
            
            {/* 자산 보기 모달 */}
            {viewingAsset && (
                <AssetViewModal 
                    asset={viewingAsset} 
                    onClose={() => setViewingAsset(null)} 
                    t={t} 
                />
            )}
            
            {/* 자산 편집 모달 */}
            {editingAsset && (
                <AssetEditModal 
                    asset={editingAsset} 
                    onClose={() => setEditingAsset(null)} 
                    onSave={handleEditSave}
                    t={t} 
                />
            )}
            
            {/* 삭제 확인 모달 */}
            {showDeleteConfirm && (
                <DeleteConfirmModal
                    assetName={assets.find(a => a.id === showDeleteConfirm)?.name || '자산'}
                    onConfirm={() => handleDelete(showDeleteConfirm)}
                    onCancel={() => setShowDeleteConfirm(null)}
                    t={t}
                />
            )}
        </div>
    );
};

const SuccessorsView: React.FC<{ user: User, onUpgrade: () => void, t: typeof translations['en'] }> = ({ user, onUpgrade, t }) => {
    const [verifiers, setVerifiers] = useLocalStorage<Verifier[]>('finalmessage_verifiers', mockVerifiers);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    const handleSave = (newVerifier: Omit<Verifier, 'id'>) => {
        const fullVerifier = { ...newVerifier, id: `v${Date.now()}` };
        setVerifiers(prev => [...prev, fullVerifier]);
        setIsAddModalOpen(false);
    };

    const handleDelete = (id: string) => {
        setVerifiers(verifiers => verifiers.filter(v => v.id !== id));
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">{t.successorsTitle}</h2>
                    <p className="text-slate-400 mt-1">{t.successorsSubtitle}</p>
                </div>
                <button onClick={() => user.plan === 'Premium' ? setIsAddModalOpen(true) : setShowPremiumModal(true)} className="flex items-center gap-2 px-3 py-2 text-sm bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md transition-colors"><PlusIcon className="w-5 h-5"/>{t.addSuccessor}</button>
            </div>

             {user.plan === 'Free' ? (
                <div className="text-center bg-slate-900/70 p-12 rounded-lg border-2 border-dashed border-slate-700">
                    <UserCircleIcon className="w-12 h-12 mx-auto text-slate-500"/>
                    <h3 className="mt-4 text-lg font-semibold text-white">{t.premiumFeature}</h3>
                    <p className="text-slate-400 mt-1">{t.premiumModalText}</p>
                    <button onClick={() => setShowPremiumModal(true)} className="mt-6 px-5 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors">{t.upgradeNow}</button>
                </div>
            ) : verifiers.length === 0 ? (
                <div className="text-center bg-slate-900/70 p-12 rounded-lg border-2 border-dashed border-slate-700">
                    <UserCircleIcon className="w-12 h-12 mx-auto text-slate-500"/>
                    <h3 className="mt-4 text-lg font-semibold text-white">{t.noSuccessors}</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {verifiers.map(verifier => (
                        <div key={verifier.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-700 rounded-full mt-1"><UserCircleIcon className="w-6 h-6 text-sky-400"/></div>
                                <div className="flex-1">
                                    <p className="font-semibold text-white">{verifier.name}</p>
                                    <p className="text-sm text-slate-400">{verifier.relationship}</p>
                                    <p className="text-xs text-slate-500">{verifier.email}</p>
                                </div>
                                <button onClick={() => handleDelete(verifier.id)} className="p-1 text-slate-500 hover:text-rose-400 rounded-md"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {isAddModalOpen && <AddSuccessorModal onClose={() => setIsAddModalOpen(false)} onSave={handleSave} t={t} />}
            {showPremiumModal && <PremiumModal onClose={() => setShowPremiumModal(false)} onUpgrade={onUpgrade} t={t} />}
        </div>
    );
};


const NotaryView: React.FC<{ user: User; onUpgrade: () => void; t: typeof translations['en'] }> = ({ user, onUpgrade, t }) => {
    const [notary, setNotary] = useLocalStorage<Notary | null>('finalmessage_notary', mockNotary);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    const handleSave = (newNotary: Omit<Notary, 'id' | 'status'>) => {
        const fullNotary: Notary = { ...newNotary, id: `n${Date.now()}`, status: 'pending' };
        setNotary(fullNotary);
        setIsAddModalOpen(false);
    };

    const handleDesignate = () => {
        if (user.plan === 'Free') {
            setShowPremiumModal(true);
        } else {
            setIsAddModalOpen(true);
        }
    };
    
    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">{t.notaryTitle}</h2>
                    <p className="text-slate-400 mt-1">{t.notarySubtitle}</p>
                </div>
            </div>
            
            <div className="bg-slate-900/70 p-8 rounded-lg border border-slate-700">
                {!notary ? (
                    <div className="text-center max-w-2xl mx-auto">
                        <LegalIcon className="w-12 h-12 mx-auto text-amber-400" />
                        <h3 className="mt-4 text-xl font-bold text-white">{t.notaryIntroTitle}</h3>
                        <p className="mt-2 text-slate-400">{t.notaryIntroDesc}</p>
                        <button onClick={handleDesignate} className="mt-6 flex items-center gap-2 mx-auto px-5 py-2 text-sm bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md transition-colors">
                            <PlusIcon className="w-5 h-5"/>{t.startDesignation}
                        </button>
                    </div>
                ) : (
                    <div>
                         <h3 className="text-lg font-semibold text-white mb-4">{t.notaryDesignated}</h3>
                         <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                             <div>
                                <p className="font-bold text-white text-lg">{notary.name}</p>
                                <p className="text-sm text-slate-400">{notary.firm}</p>
                                <p className="text-xs text-slate-500">{notary.email}</p>
                             </div>
                             <div className="flex items-center gap-4">
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">{t.status}</p>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${notary.status === 'accepted' ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                        {notary.status === 'accepted' ? t.accepted : t.pending}
                                    </span>
                                </div>
                                {notary.status === 'pending' && (
                                     <button className="p-2 text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-md transition-colors" title={t.resendInvite}>
                                        <PaperAirplaneIcon className="w-5 h-5" />
                                     </button>
                                )}
                             </div>
                         </div>
                         <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-end text-sm">
                             {notary.status === 'pending' && <button onClick={() => setNotary(prev => prev ? {...prev, status: 'accepted'} : null)} className="px-3 py-1 text-slate-300 hover:text-white bg-green-600/50 hover:bg-green-600 rounded-md transition-colors">{t.simulateAcceptance}</button>}
                             <button onClick={() => setNotary(null)} className="px-3 py-1 text-slate-400 hover:text-rose-400 bg-slate-700/50 hover:bg-slate-700 rounded-md transition-colors">{t.cancelDesignation}</button>
                         </div>
                    </div>
                )}
            </div>

            {isAddModalOpen && <AddNotaryModal onClose={() => setIsAddModalOpen(false)} onSave={handleSave} t={t} />}
            {showPremiumModal && <PremiumModal onClose={() => setShowPremiumModal(false)} onUpgrade={onUpgrade} t={t} />}
        </div>
    );
};

// FIX: Add language prop to SettingsView
const SettingsView: React.FC<{ user: User, onPlanChange: (user: User) => void; t: typeof translations['en']; language: Language }> = ({ user, onPlanChange, t, language }) => {
    const [settings, setSettings] = useLocalStorage('finalmessage_settings', mockSettings);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSettingsChange = (key: keyof typeof settings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleUpgrade = (plan: SubscriptionPlan) => {
        setSelectedPlan(plan);
        setIsPaymentModalOpen(true);
    };
    
    const handlePaymentSuccess = (planType: SubscriptionPlan, newSubscription: User['subscription']) => {
        onPlanChange({ ...user, plan: 'Premium', subscription: newSubscription });
        setIsPaymentModalOpen(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    }

    const PlanCard: React.FC<{
        plan: SubscriptionPlan;
        title: string;
        price: string;
        originalPrice?: string;
        period: string;
        discount?: string;
        features: string[];
        isCurrent: boolean;
        isPopular?: boolean;
    }> = ({ plan, title, price, originalPrice, period, discount, features, isCurrent, isPopular }) => (
        <div className={`relative p-6 rounded-lg border-2 ${isPopular ? 'border-sky-500' : 'border-slate-700'} bg-slate-800/50 flex flex-col`}>
            {isPopular && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-sky-500 text-white text-xs font-bold rounded-full">POPULAR</div>}
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <div className="my-4">
                <span className="text-3xl font-extrabold text-white">{price}</span>
                {originalPrice && <span className="text-lg line-through text-slate-500 ml-2">{originalPrice}</span>}
                <span className="text-slate-400 text-sm"> / {period}</span>
            </div>
             {discount && <p className="text-sm font-semibold text-amber-400 mb-4">{discount}</p>}
            <ul className="space-y-2 text-slate-300 text-sm mb-6 flex-grow">
                {features.map(f => <li key={f} className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-green-400"/>{f}</li>)}
            </ul>
            {isCurrent ? (
                <button disabled className="w-full mt-auto py-2 px-4 bg-slate-700 text-slate-400 font-semibold rounded-md cursor-not-allowed">Current Plan</button>
            ) : (
                <button onClick={() => handleUpgrade(plan)} className="w-full mt-auto py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md transition-colors">{t.choosePlan}</button>
            )}
        </div>
    );

    return (
        <div>
            <h2 className="text-2xl font-bold text-white">{t.settingsTitle}</h2>
            <p className="text-slate-400 mt-1 mb-8">{t.settingsSubtitle}</p>
            
            <div className="space-y-8 max-w-4xl mx-auto">
                {/* Inactivity Trigger */}
                <div className="bg-slate-900/70 p-6 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-lg text-white">{t.inactivityTriggerTitle}</h3>
                            <p className="text-sm text-slate-400 mt-1">{t.inactivityTriggerDesc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={settings.inactivityTrigger.enabled} onChange={e => handleSettingsChange('inactivityTrigger', { ...settings.inactivityTrigger, enabled: e.target.checked })} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-sky-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                        </label>
                    </div>
                    {settings.inactivityTrigger.enabled && (
                        <div className="mt-4 border-t border-slate-700 pt-4">
                            <label htmlFor="inactivity-period" className="block text-sm font-medium text-slate-300">{t.inactivityPeriod}</label>
                            <div className="flex items-center gap-2 mt-1">
                                <input id="inactivity-period" type="number" value={settings.inactivityTrigger.period} onChange={e => handleSettingsChange('inactivityTrigger', { ...settings.inactivityTrigger, period: parseInt(e.target.value, 10) || 30 })} className="w-24 bg-slate-700/50 border border-slate-600 rounded-md py-1 px-2 text-white" />
                                <span>{t.days}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">{t.inactivityPeriodDesc}</p>
                            <p className="text-sm text-slate-400 mt-4">{t.lastCheckIn} {new Date().toLocaleDateString()}</p>
                        </div>
                    )}
                </div>

                {/* Payment Management */}
                <div className="bg-slate-900/70 p-6 rounded-lg border border-slate-700">
                    <h3 className="font-semibold text-lg text-white mb-4">{t.paymentManagement}</h3>
                    
                    {user.plan === 'Premium' && user.subscription ? (
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-slate-400 text-sm">{t.yourCurrentPlan}</p>
                                    <p className="font-bold text-white">{
                                        user.subscription.planType === 'Monthly' ? t.monthlyPlan :
                                        user.subscription.planType === 'Annual' ? t.annualPlan : t.lifetimePlan
                                    }</p>
                                </div>
                                {user.subscription.planType !== 'Lifetime' &&
                                    <p className="text-sm text-slate-400">{t.nextPayment} {user.subscription.nextPaymentDate}</p>
                                }
                            </div>
                            <div className="border-t border-slate-700 mt-3 pt-3 flex justify-between items-center">
                                <p className="text-sm text-slate-400">{t.paymentMethod}: <span className="font-semibold text-slate-300">{user.subscription.paymentMethod.details}</span></p>
                                <div className="flex gap-2">
                                     <button className="text-sm text-sky-400 hover:text-sky-300 font-semibold">{t.changePlan}</button>
                                     <button className="text-sm text-slate-400 hover:text-rose-400">{t.cancelSubscription}</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <PlanCard
                                    plan="Monthly"
                                    title={t.monthlyPlan}
                                    // FIX: Use language prop instead of t.language
                                    price={language === 'ko' ? t.pricePerMonth.replace('월 ', '') : t.pricePerMonth.replace('/ month', '')}
                                    period={language === 'ko' ? '월' : 'month'}
                                    features={[t.premiumFeatureAI, t.premiumFeatureMultimedia, t.premiumFeatureAssets, t.premiumFeatureSuccessors, t.premiumFeatureNotary]}
                                    isCurrent={false}
                                />
                                <PlanCard
                                    plan="Annual"
                                    title={t.annualPlan}
                                    // FIX: Use language prop instead of t.language
                                    price={language === 'ko' ? t.pricePerYear.replace('연 ', '') : t.pricePerYear.replace('/ year', '')}
                                    originalPrice={t.originalPriceYear}
                                    period={language === 'ko' ? '년' : 'year'}
                                    discount={t.save30Percent}
                                    features={[t.premiumFeatureAI, t.premiumFeatureMultimedia, t.premiumFeatureAssets, t.premiumFeatureSuccessors, t.premiumFeatureNotary]}
                                    isCurrent={false}
                                    isPopular
                                />
                                 <PlanCard
                                    plan="Lifetime"
                                    title={t.lifetimePlan}
                                    price={t.priceLifetime}
                                    originalPrice={t.originalPriceLifetime}
                                    period={t.billedOnce}
                                    features={[...[t.premiumFeatureAI, t.premiumFeatureMultimedia, t.premiumFeatureAssets, t.premiumFeatureSuccessors, t.premiumFeatureNotary], t.lifetimeFeature1, t.lifetimeFeature2, t.lifetimeFeature3, t.lifetimeFeature4]}
                                    isCurrent={false}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {isPaymentModalOpen && selectedPlan && <PaymentModal plan={selectedPlan} onClose={() => setIsPaymentModalOpen(false)} onSuccess={handlePaymentSuccess} t={t}/>}
             {showSuccess && (
                <div className="fixed bottom-8 right-8 bg-green-500/90 text-white p-4 rounded-lg shadow-lg flex items-center gap-3 z-50">
                    <CheckCircleIcon className="w-6 h-6"/>
                    <div>
                        <p className="font-bold">{t.paymentSuccess}</p>
                        <p className="text-sm">{t.paymentSuccessDesc}</p>
                    </div>
                </div>
             )}
        </div>
    );
};


// --- MAIN APP COMPONENT ---

interface ApplicationProps {
  language: Language;
  user: User;
  setUser: (user: User) => void;
  onLogout: () => void;
}

// 자산 보기 모달
const AssetViewModal: React.FC<{
    asset: Asset;
    onClose: () => void;
    t: typeof translations['en'];
}> = ({ asset, onClose, t }) => {
    const parsedTags = parseHashtags(asset.tags || []);
    const security = getSecurityLevel(asset.importance);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">자산 정보</h3>
                        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-md">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">이름</label>
                            <div className="text-white">{asset.name}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">유형</label>
                            <div className="text-slate-300">{asset.type === 'BankAccount' ? '은행계좌' : asset.type === 'CryptoWallet' ? '암호화폐 지갑' : '비밀 메모'}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">중요도</label>
                            <div className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${security.color === 'text-red-400' ? 'bg-red-500/20 text-red-400' : security.color === 'text-amber-400' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                                {asset.importance === 'high' ? '높음' : asset.importance === 'medium' ? '중간' : '낮음'}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">해시태그</label>
                            <div className="flex flex-wrap gap-1">
                                {parsedTags.map((tagObj, idx) => (
                                    <span key={idx} className={`px-2 py-0.5 text-xs font-medium rounded-full ${tagObj.color}`}>
                                        #{tagObj.tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {asset.type === 'BankAccount' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">은행</label>
                                    <div className="text-slate-300">{asset.bankName}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">계좌번호</label>
                                    <div className="text-slate-300 font-mono">{asset.accountNumber}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">메모</label>
                                    <div className="text-slate-300">{asset.notes}</div>
                                </div>
                            </>
                        )}

                        {asset.type === 'CryptoWallet' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">암호화폐</label>
                                    <div className="text-slate-300">{asset.cryptoName}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">주소</label>
                                    <div className="text-slate-300 font-mono text-xs break-all">{asset.address}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">시드구문</label>
                                    <div className="text-slate-300 font-mono text-xs">{asset.seedPhrase}</div>
                                </div>
                            </>
                        )}

                        {asset.type === 'SecretNote' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">내용</label>
                                <div className="text-slate-300 whitespace-pre-wrap">{asset.content}</div>
                            </div>
                        )}

                        {asset.password && (
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">비밀번호</label>
                                <div className="text-slate-300 font-mono">{asset.password}</div>
                            </div>
                        )}

                        {asset.recoveryEmail && (
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">복구 이메일</label>
                                <div className="text-slate-300">{asset.recoveryEmail}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 자산 편집 모달
const AssetEditModal: React.FC<{
    asset: Asset;
    onClose: () => void;
    onSave: (asset: Asset) => void;
    t: typeof translations['en'];
}> = ({ asset, onClose, onSave, t }) => {
    const [editedAsset, setEditedAsset] = useState<Asset>({ ...asset });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(editedAsset);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
                <form onSubmit={handleSave}>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">자산 편집</h3>
                            <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-md">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">이름</label>
                                <input
                                    type="text"
                                    value={editedAsset.name}
                                    onChange={(e) => setEditedAsset(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">중요도</label>
                                <select
                                    value={editedAsset.importance}
                                    onChange={(e) => setEditedAsset(prev => ({ ...prev, importance: e.target.value as 'high' | 'medium' | 'low' }))}
                                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                                >
                                    <option value="low">낮음</option>
                                    <option value="medium">중간</option>
                                    <option value="high">높음</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">해시태그 (쉼표로 구분)</label>
                                <input
                                    type="text"
                                    value={editedAsset.tags.join(', ')}
                                    onChange={(e) => setEditedAsset(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) }))}
                                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                                    placeholder="#주계좌, #비상금"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">비밀번호</label>
                                <input
                                    type="password"
                                    value={editedAsset.password || ''}
                                    onChange={(e) => setEditedAsset(prev => ({ ...prev, password: e.target.value || undefined }))}
                                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                                    placeholder="선택사항"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">복구 이메일</label>
                                <input
                                    type="email"
                                    value={editedAsset.recoveryEmail || ''}
                                    onChange={(e) => setEditedAsset(prev => ({ ...prev, recoveryEmail: e.target.value || undefined }))}
                                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                                    placeholder="선택사항"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isLocked"
                                    checked={editedAsset.isLocked}
                                    onChange={(e) => setEditedAsset(prev => ({ ...prev, isLocked: e.target.checked }))}
                                    className="rounded"
                                />
                                <label htmlFor="isLocked" className="text-sm text-slate-300">잠금 설정</label>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors"
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// 삭제 확인 모달
const DeleteConfirmModal: React.FC<{
    assetName: string;
    onConfirm: () => void;
    onCancel: () => void;
    t: typeof translations['en'];
}> = ({ assetName, onConfirm, onCancel, t }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-sm">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-500/20 rounded-full">
                            <TrashIcon className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">자산 삭제</h3>
                            <p className="text-sm text-slate-400">이 작업은 되돌릴 수 없습니다</p>
                        </div>
                    </div>
                    
                    <p className="text-slate-300 mb-6">
                        <span className="font-semibold">{assetName}</span>을(를) 정말로 삭제하시겠습니까?
                    </p>

                    <div className="flex gap-2">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                        >
                            삭제
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Application: React.FC<ApplicationProps> = ({ language, user, setUser, onLogout }) => {
    const [activeTab, setActiveTab] = useLocalStorage('finalmessage_activeTab', 'home');
    const t = translations[language];

    const handleUpgrade = () => {
        setActiveTab('settings');
    }

    const tabs = [
        { id: 'home', icon: <HomeIcon />, text: t.homeTab },
        { id: 'message', icon: <DocumentTextIcon />, text: t.messageTab },
        { id: 'multimedia', icon: <MultimediaIcon />, text: t.multimediaTab, premium: true },
        { id: 'assets', icon: <VaultIcon />, text: t.assetsTab, premium: true },
        { id: 'successors', icon: <UserCircleIcon />, text: t.successorsTab, premium: true },
        { id: 'notary', icon: <LegalIcon />, text: t.notaryTab, premium: true },
        { id: 'settings', icon: <Cog6ToothIcon />, text: t.settingsTab },
    ];

    const renderView = () => {
        switch(activeTab) {
            case 'home': return <HomeView user={user} setActiveTab={setActiveTab} t={t} />;
            case 'message': return <MessageManager language={language} onUpgrade={handleUpgrade} />;
            case 'multimedia': return <MultimediaView user={user} onUpgrade={handleUpgrade} t={t} />;
            case 'assets': return <AssetsView user={user} onUpgrade={handleUpgrade} t={t} />;
            case 'successors': return <SuccessorsView user={user} onUpgrade={handleUpgrade} t={t} />;
            case 'notary': return <NotaryView user={user} onUpgrade={handleUpgrade} t={t} />;
            // FIX: Pass language prop to SettingsView
            case 'settings': return <SettingsView user={user} onPlanChange={setUser} t={t} language={language} />;
            default: return <HomeView user={user} setActiveTab={setActiveTab} t={t} />;
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900/70 border-r border-slate-800 flex-shrink-0 p-4 flex flex-col">
                <div className="px-2 mb-8">
                    <h1 className="text-2xl font-bold text-white">FinalMessage</h1>
                </div>
                <nav className="flex-grow">
                    <ul className="space-y-2">
                    {tabs.map(tab => (
                        <li key={tab.id}>
                            <button
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'}`}
                            >
                                {tab.icon}
                                <span>{tab.text}</span>
                                {tab.premium && user.plan === 'Free' && <span className="ml-auto text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">Premium</span>}
                            </button>
                        </li>
                    ))}
                    </ul>
                </nav>
                 <div className="border-t border-slate-800 p-2 mt-4">
                    <div className="flex items-center gap-3">
                        <UserCircleIcon className="w-10 h-10 text-slate-500"/>
                        <div>
                            <p className="font-semibold text-white">{user.name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                         <button onClick={onLogout} title={t.logout} className="ml-auto p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"><LogoutIcon/></button>
                    </div>
                 </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 sm:p-8 lg:p-10 bg-grid-slate-700/[0.05]">
                <div className="max-w-7xl mx-auto">
                    {renderView()}
                </div>
            </main>
        </div>
    );
};

export default Application;
