import React, { useState } from 'react';
import { SubscriptionManager } from './SubscriptionManager';
import { 
    CheckCircleIcon,
    StarIcon,
    CrownIcon,
    SparklesIcon,
    ArrowRightIcon 
} from './icons';

interface PricingViewProps {
    language: 'en' | 'ko';
    currentUser: any;
    onPlanChange: (newUser: any) => void;
    onGetStarted?: () => void;
}

const translations = {
    en: {
        title: 'Choose Your Plan',
        subtitle: 'Select the perfect plan for your digital legacy needs',
        getStarted: 'Get Started',
        choosePlan: 'Choose Plan',
        mostPopular: 'Most Popular',
        currentPlan: 'Current Plan',
        
        // Plan features
        features: {
            messages: 'Messages',
            emailDelivery: 'Email Delivery',
            basicSupport: 'Basic Support',
            legalNotary: 'Legal Notary',
            prioritySupport: 'Priority Support',
            blockchainVerify: 'Blockchain Verification',
            bulkMessage: 'Bulk Messages',
            advancedSecurity: 'Advanced Security',
            unlimitedMessages: 'Unlimited Messages'
        },
        
        // Plan descriptions
        freeDesc: 'Perfect for getting started with basic final message features',
        premiumDesc: 'Ideal for individuals who want comprehensive legacy planning',
        proDesc: 'For businesses and users who need advanced features and high volume',
        
        // Billing
        monthly: 'Monthly',
        yearly: 'Yearly',
        save20: 'Save 20%',
        billed: 'Billed',
        
        // FAQ
        faqTitle: 'Frequently Asked Questions',
        faq: [
            {
                q: 'What happens to my messages if I cancel?',
                a: 'Your messages remain secure and will still be delivered as scheduled. You just won\'t be able to create new ones.'
            },
            {
                q: 'Can I upgrade or downgrade anytime?',
                a: 'Yes, you can change your plan at any time. Upgrades take effect immediately, downgrades at the next billing cycle.'
            },
            {
                q: 'Is my data secure?',
                a: 'Absolutely. We use AES-256 encryption and blockchain technology to ensure your messages are tamper-proof and secure.'
            },
            {
                q: 'What is legal notary verification?',
                a: 'Our legal notary service provides official verification of your final messages, making them legally binding documents.'
            }
        ]
    },
    ko: {
        title: '플랜 선택',
        subtitle: '디지털 유산 관리에 최적화된 플랜을 선택하세요',
        getStarted: '시작하기',
        choosePlan: '플랜 선택',
        mostPopular: '가장 인기',
        currentPlan: '현재 플랜',
        
        // Plan features
        features: {
            messages: '메시지',
            emailDelivery: '이메일 전송',
            basicSupport: '기본 지원',
            legalNotary: '법적 공증',
            prioritySupport: '우선 지원',
            blockchainVerify: '블록체인 검증',
            bulkMessage: '대량 메시지',
            advancedSecurity: '고급 보안',
            unlimitedMessages: '무제한 메시지'
        },
        
        // Plan descriptions
        freeDesc: '기본적인 최종 메시지 기능으로 시작하기에 완벽',
        premiumDesc: '포괄적인 유산 계획을 원하는 개인에게 이상적',
        proDesc: '고급 기능과 대용량이 필요한 비즈니스 및 사용자용',
        
        // Billing
        monthly: '월간',
        yearly: '연간',
        save20: '20% 할인',
        billed: '청구',
        
        // FAQ
        faqTitle: '자주 묻는 질문',
        faq: [
            {
                q: '구독을 취소하면 메시지는 어떻게 되나요?',
                a: '메시지는 안전하게 보관되며 예정된 대로 전달됩니다. 단지 새로운 메시지를 생성할 수 없게 됩니다.'
            },
            {
                q: '언제든지 업그레이드나 다운그레이드가 가능한가요?',
                a: '네, 언제든지 플랜을 변경할 수 있습니다. 업그레이드는 즉시 적용되고, 다운그레이드는 다음 결제 주기에 적용됩니다.'
            },
            {
                q: '내 데이터는 안전한가요?',
                a: '물론입니다. AES-256 암호화와 블록체인 기술을 사용하여 메시지가 변조 방지되고 안전하도록 보장합니다.'
            },
            {
                q: '법적 공증 검증이란 무엇인가요?',
                a: '법적 공증 서비스는 최종 메시지의 공식 검증을 제공하여 법적 구속력 있는 문서로 만들어줍니다.'
            }
        ]
    }
};

export const PricingView: React.FC<PricingViewProps> = ({ 
    language, 
    currentUser, 
    onPlanChange, 
    onGetStarted 
}) => {
    const t = translations[language];
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    // 플랜 데이터
    const plans = [
        {
            id: 'free',
            name: 'Free',
            description: t.freeDesc,
            price: 0,
            originalPrice: 0,
            features: [
                `3 ${t.features.messages}`,
                t.features.emailDelivery,
                t.features.basicSupport
            ],
            icon: <StarIcon className="w-8 h-8 text-amber-400" />,
            buttonText: t.getStarted,
            buttonStyle: 'bg-slate-700 hover:bg-slate-600'
        },
        {
            id: 'premium',
            name: 'Premium',
            description: t.premiumDesc,
            price: billingCycle === 'monthly' ? 15000 : 144000,
            originalPrice: billingCycle === 'monthly' ? 0 : 180000,
            popular: true,
            features: [
                `50 ${t.features.messages}`,
                t.features.emailDelivery,
                t.features.legalNotary,
                t.features.prioritySupport,
                t.features.blockchainVerify
            ],
            icon: <SparklesIcon className="w-8 h-8 text-sky-400" />,
            buttonText: t.choosePlan,
            buttonStyle: 'bg-sky-600 hover:bg-sky-700'
        },
        {
            id: 'pro',
            name: 'Pro',
            description: t.proDesc,
            price: billingCycle === 'monthly' ? 25000 : 240000,
            originalPrice: billingCycle === 'monthly' ? 0 : 300000,
            features: [
                t.features.unlimitedMessages,
                t.features.emailDelivery,
                t.features.legalNotary,
                t.features.prioritySupport,
                t.features.blockchainVerify,
                t.features.bulkMessage,
                t.features.advancedSecurity
            ],
            icon: <CrownIcon className="w-8 h-8 text-purple-400" />,
            buttonText: t.choosePlan,
            buttonStyle: 'bg-purple-600 hover:bg-purple-700'
        },
        {
            id: 'lifetime',
            name: 'Lifetime',
            description: language === 'ko' ? '한 번 결제로 평생 사용하는 최고급 플랜' : 'Pay once, use forever - ultimate plan',
            price: 1400000,
            originalPrice: 2000000,
            lifetime: true,
            features: [
                t.features.unlimitedMessages,
                t.features.emailDelivery,
                t.features.legalNotary,
                t.features.prioritySupport,
                t.features.blockchainVerify,
                t.features.bulkMessage,
                t.features.advancedSecurity,
                language === 'ko' ? '평생 사용' : 'Lifetime Access',
                language === 'ko' ? '모든 미래 기능 포함' : 'All Future Features Included'
            ],
            icon: <CrownIcon className="w-8 h-8 text-yellow-400" />,
            buttonText: t.choosePlan,
            buttonStyle: 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700'
        }
    ];

    return (
        <div className="space-y-12">
            {/* 헤더 */}
            <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4">{t.title}</h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">{t.subtitle}</p>
            </div>

            {/* 빌링 사이클 토글 */}
            <div className="flex justify-center">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-1">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            billingCycle === 'monthly'
                                ? 'bg-sky-600 text-white'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        {t.monthly}
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                            billingCycle === 'yearly'
                                ? 'bg-sky-600 text-white'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        {t.yearly}
                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            {t.save20}
                        </span>
                    </button>
                </div>
            </div>

            {/* 플랜 카드들 */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative border rounded-2xl p-8 transition-all hover:border-sky-500/50 ${
                            plan.popular 
                                ? 'border-sky-500/50 ring-1 ring-sky-500/20 scale-105 bg-slate-800/50' 
                                : plan.lifetime
                                ? 'border-yellow-500/50 ring-2 ring-yellow-500/30 scale-105 bg-gradient-to-br from-slate-800/80 to-yellow-900/20'
                                : 'border-slate-700 bg-slate-800/50'
                        }`}
                    >
                        {/* 인기 배지 */}
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <span className="bg-sky-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                                    {t.mostPopular}
                                </span>
                            </div>
                        )}
                        
                        {/* 평생 요금제 배지 */}
                        {plan.lifetime && (
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <span className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                                    ⭐ {language === 'ko' ? 'LIFETIME' : 'LIFETIME'}
                                </span>
                            </div>
                        )}

                        {/* 플랜 헤더 */}
                        <div className="text-center mb-8">
                            <div className="flex justify-center mb-4">
                                {plan.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                            <p className="text-slate-400 text-sm mb-6">{plan.description}</p>
                            
                            {/* 가격 */}
                            <div className="mb-6">
                                {plan.price === 0 ? (
                                    <div className="text-4xl font-bold text-white">Free</div>
                                ) : plan.lifetime ? (
                                    <div>
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <span className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                                                ₩{plan.price.toLocaleString()}
                                            </span>
                                            <span className="text-slate-400">
                                                /{language === 'ko' ? '평생' : 'lifetime'}
                                            </span>
                                        </div>
                                        <div className="text-slate-500 line-through text-lg">
                                            ₩{plan.originalPrice.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-green-400 mt-1 font-medium">
                                            30% 할인 (60만원 절약!)
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-4xl font-bold text-white">
                                                ₩{plan.price.toLocaleString()}
                                            </span>
                                            <span className="text-slate-400">
                                                /{billingCycle === 'monthly' ? t.monthly.toLowerCase() : t.yearly.toLowerCase()}
                                            </span>
                                        </div>
                                        {billingCycle === 'yearly' && plan.originalPrice > plan.price && (
                                            <div className="text-slate-500 line-through text-lg">
                                                ₩{plan.originalPrice.toLocaleString()}
                                            </div>
                                        )}
                                        <div className="text-sm text-slate-400 mt-1">
                                            {t.billed} {billingCycle === 'monthly' ? t.monthly.toLowerCase() : t.yearly.toLowerCase()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 기능 목록 */}
                        <div className="space-y-4 mb-8">
                            {plan.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <span className="text-slate-300">{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* 액션 버튼 */}
                        <button
                            onClick={() => {
                                if (plan.id === 'free' && onGetStarted) {
                                    onGetStarted();
                                } else {
                                    // 플랜 선택 로직
                                    onPlanChange({ ...currentUser, plan: plan.name });
                                }
                            }}
                            className={`w-full py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${plan.buttonStyle} text-white`}
                        >
                            {plan.buttonText}
                            <ArrowRightIcon className="w-4 h-4" />
                        </button>

                        {/* 현재 플랜 표시 */}
                        {currentUser?.plan === plan.name && (
                            <div className="mt-4 text-center">
                                <span className="bg-green-900/30 border border-green-600/30 text-green-400 px-3 py-1 rounded-full text-sm">
                                    {t.currentPlan}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* FAQ 섹션 */}
            <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-white text-center mb-8">{t.faqTitle}</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {t.faq.map((item, index) => (
                        <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                            <h3 className="font-semibold text-white mb-3">{item.q}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{item.a}</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};