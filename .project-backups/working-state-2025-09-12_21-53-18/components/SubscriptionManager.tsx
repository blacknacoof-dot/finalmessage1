import React, { useState, useEffect } from 'react';
import { 
    CreditCardIcon,
    CheckCircleIcon,
    XMarkIcon,
    StarIcon,
    CrownIcon,
    SparklesIcon 
} from '../components/icons';
import { subscriptionAPI } from '../services/api';

// 구독 플랜 타입 정의
interface SubscriptionPlan {
    id: number;
    name: string;
    description: string;
    price: number;
    currency: string;
    duration: 'monthly' | 'yearly';
    features: string[];
    maxMessages: number;
    legalNotary: boolean;
    recommended?: boolean;
}

interface UserSubscription {
    plan: SubscriptionPlan | null;
    status: 'active' | 'inactive' | 'expired' | 'cancelled';
    expiresAt: string | null;
    autoRenew: boolean;
    usage: {
        messages: number;
        legalNotary: number;
    };
    limits: {
        messages: number;
        legalNotary: number;
    };
}

interface SubscriptionManagerProps {
    language: 'en' | 'ko';
    currentUser: any;
    onPlanChange: (newPlan: any) => void;
}

const translations = {
    en: {
        title: 'Subscription Management',
        subtitle: 'Choose the plan that best fits your needs',
        currentPlan: 'Current Plan',
        upgradeNow: 'Upgrade Now',
        downgrade: 'Downgrade',
        changePlan: 'Change Plan',
        manageSubscription: 'Manage Subscription',
        cancel: 'Cancel Subscription',
        resume: 'Resume Subscription',
        usage: 'Usage',
        features: 'Features',
        mostPopular: 'Most Popular',
        recommended: 'Recommended',
        free: 'Free',
        month: '/month',
        year: '/year',
        annually: 'Annually',
        monthly: 'Monthly',
        save: 'Save 20%',
        unlimited: 'Unlimited',
        
        // 플랜별 기능
        basicMessage: 'Basic Messages',
        emailDelivery: 'Email Delivery',
        legalNotary: 'Legal Notary',
        prioritySupport: 'Priority Support',
        blockchainVerify: 'Blockchain Verification',
        bulkMessage: 'Bulk Messages',
        advancedSecurity: 'Advanced Security',
        
        // 사용량
        usageMessages: 'Messages used',
        usageNotary: 'Legal notarizations used',
        remaining: 'remaining',
        
        // 상태
        statusActive: 'Active',
        statusExpired: 'Expired',
        statusCancelled: 'Cancelled',
        expiresOn: 'Expires on',
        renewsOn: 'Renews on',
        
        // 결제
        paymentMethod: 'Payment Method',
        billingHistory: 'Billing History',
        nextBilling: 'Next Billing',
        
        // 액션
        confirmCancel: 'Are you sure you want to cancel your subscription?',
        confirmUpgrade: 'Upgrade to {{plan}} plan?',
        
        // 오류 및 성공
        error: {
            loadPlans: 'Failed to load subscription plans',
            loadStatus: 'Failed to load subscription status',
            upgrade: 'Failed to upgrade subscription',
            cancel: 'Failed to cancel subscription'
        },
        success: {
            upgraded: 'Successfully upgraded to {{plan}}',
            cancelled: 'Subscription cancelled successfully',
            resumed: 'Subscription resumed successfully'
        }
    },
    ko: {
        title: '구독 관리',
        subtitle: '필요에 맞는 최적의 플랜을 선택하세요',
        currentPlan: '현재 플랜',
        upgradeNow: '지금 업그레이드',
        downgrade: '다운그레이드',
        changePlan: '플랜 변경',
        manageSubscription: '구독 관리',
        cancel: '구독 취소',
        resume: '구독 재개',
        usage: '사용량',
        features: '기능',
        mostPopular: '가장 인기',
        recommended: '추천',
        free: '무료',
        month: '/월',
        year: '/년',
        annually: '연간',
        monthly: '월간',
        save: '20% 할인',
        unlimited: '무제한',
        
        // 플랜별 기능
        basicMessage: '기본 메시지',
        emailDelivery: '이메일 전송',
        legalNotary: '법적 공증',
        prioritySupport: '우선 지원',
        blockchainVerify: '블록체인 검증',
        bulkMessage: '대량 메시지',
        advancedSecurity: '고급 보안',
        
        // 사용량
        usageMessages: '사용한 메시지',
        usageNotary: '사용한 법적 공증',
        remaining: '남음',
        
        // 상태
        statusActive: '활성',
        statusExpired: '만료됨',
        statusCancelled: '취소됨',
        expiresOn: '만료일',
        renewsOn: '갱신일',
        
        // 결제
        paymentMethod: '결제 방법',
        billingHistory: '결제 내역',
        nextBilling: '다음 결제',
        
        // 액션
        confirmCancel: '정말 구독을 취소하시겠습니까?',
        confirmUpgrade: '{{plan}} 플랜으로 업그레이드하시겠습니까?',
        
        // 오류 및 성공
        error: {
            loadPlans: '구독 플랜 로드에 실패했습니다',
            loadStatus: '구독 상태 로드에 실패했습니다',
            upgrade: '구독 업그레이드에 실패했습니다',
            cancel: '구독 취소에 실패했습니다'
        },
        success: {
            upgraded: '{{plan}} 플랜으로 성공적으로 업그레이드되었습니다',
            cancelled: '구독이 성공적으로 취소되었습니다',
            resumed: '구독이 성공적으로 재개되었습니다'
        }
    }
};

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ 
    language, 
    currentUser, 
    onPlanChange 
}) => {
    const t = translations[language];
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

    // 플랜 및 구독 상태 로드
    const loadData = async () => {
        try {
            setLoading(true);
            
            // 목업 데이터 사용 (백엔드 연결 실패 시)
            const mockPlans: SubscriptionPlan[] = [
                {
                    id: 1,
                    name: 'Free',
                    description: language === 'ko' ? '기본 기능을 무료로 체험' : 'Try basic features for free',
                    price: 0,
                    currency: 'KRW',
                    duration: 'monthly',
                    features: [t.basicMessage, t.emailDelivery],
                    maxMessages: 3,
                    legalNotary: false
                },
                {
                    id: 2,
                    name: 'Premium',
                    description: language === 'ko' ? '개인 사용자를 위한 완전한 기능' : 'Full features for personal use',
                    price: 15000,
                    currency: 'KRW',
                    duration: 'monthly',
                    features: [t.basicMessage, t.emailDelivery, t.legalNotary, t.prioritySupport, t.blockchainVerify],
                    maxMessages: 50,
                    legalNotary: true,
                    recommended: true
                },
                {
                    id: 3,
                    name: 'Pro',
                    description: language === 'ko' ? '비즈니스 및 고급 사용자용' : 'For business and power users',
                    price: 240000,
                    currency: 'KRW',
                    duration: 'yearly',
                    features: [t.basicMessage, t.emailDelivery, t.legalNotary, t.prioritySupport, t.blockchainVerify, t.bulkMessage, t.advancedSecurity],
                    maxMessages: 500,
                    legalNotary: true
                },
                {
                    id: 4,
                    name: 'Lifetime',
                    description: language === 'ko' ? '한 번 결제로 평생 사용하는 최고급 플랜' : 'Pay once, use forever - ultimate plan',
                    price: 1400000,
                    currency: 'KRW',
                    duration: 'yearly',
                    features: [t.basicMessage, t.emailDelivery, t.legalNotary, t.prioritySupport, t.blockchainVerify, t.bulkMessage, t.advancedSecurity, language === 'ko' ? '평생 무료 업데이트' : 'Lifetime free updates', language === 'ko' ? '우선 고객지원' : 'Priority customer support', language === 'ko' ? '무제한 메시지' : 'Unlimited messages'],
                    maxMessages: 999999,
                    legalNotary: true
                }
            ];

            const mockSubscription: UserSubscription = {
                plan: mockPlans[0], // Free plan
                status: 'active',
                expiresAt: null,
                autoRenew: false,
                usage: {
                    messages: 1,
                    legalNotary: 0
                },
                limits: {
                    messages: 3,
                    legalNotary: 0
                }
            };

            setPlans(mockPlans);
            setSubscription(mockSubscription);
            setError('');
        } catch (err) {
            setError(t.error.loadPlans);
            console.error('Load subscription data error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [language]);

    // 플랜 업그레이드
    const handleUpgrade = async (plan: SubscriptionPlan) => {
        const confirmMessage = t.confirmUpgrade.replace('{{plan}}', plan.name);
        if (!confirm(confirmMessage)) return;

        try {
            setLoading(true);
            
            // 실제 결제 처리는 PortOne으로 진행
            if (plan.price > 0) {
                await processPayment(plan);
            }
            
            // 구독 상태 업데이트
            setSubscription(prev => prev ? {
                ...prev,
                plan: plan,
                status: 'active',
                expiresAt: new Date(Date.now() + (plan.duration === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
                limits: {
                    messages: plan.maxMessages,
                    legalNotary: plan.legalNotary ? 10 : 0
                }
            } : null);

            onPlanChange({ ...currentUser, plan: plan.name });
            alert(t.success.upgraded.replace('{{plan}}', plan.name));
        } catch (err) {
            setError(t.error.upgrade);
            console.error('Upgrade error:', err);
        } finally {
            setLoading(false);
        }
    };

    // 결제 처리
    const processPayment = async (plan: SubscriptionPlan) => {
        return new Promise((resolve, reject) => {
            // PortOne 결제 연동 (실제 구현에서는 백엔드 API와 연동)
            if (typeof window !== 'undefined' && window.PortOne) {
                window.PortOne.requestPayment({
                    storeId: "store-id",
                    channelKey: "channel-key",
                    paymentId: `payment-${Date.now()}`,
                    orderName: `${plan.name} Plan Subscription`,
                    totalAmount: plan.price,
                    currency: plan.currency,
                    payMethod: "CARD",
                    customer: {
                        fullName: currentUser.name,
                        email: currentUser.email,
                    },
                }, (response: any) => {
                    if (response.code != null) {
                        reject(new Error(`Payment failed: ${response.message}`));
                    } else {
                        resolve(response);
                    }
                });
            } else {
                // 목업 결제 성공
                setTimeout(() => resolve({}), 1000);
            }
        });
    };

    // 구독 취소
    const handleCancel = async () => {
        if (!confirm(t.confirmCancel)) return;

        try {
            setSubscription(prev => prev ? {
                ...prev,
                status: 'cancelled',
                autoRenew: false
            } : null);
            
            alert(t.success.cancelled);
        } catch (err) {
            setError(t.error.cancel);
            console.error('Cancel subscription error:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-slate-400">Loading subscription data...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* 헤더 */}
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">{t.title}</h2>
                <p className="text-slate-400">{t.subtitle}</p>
            </div>

            {/* 오류 메시지 */}
            {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            {/* 현재 구독 상태 */}
            {subscription && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-white">{t.currentPlan}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            subscription.status === 'active' 
                                ? 'bg-green-900/30 border border-green-600/30 text-green-400'
                                : 'bg-red-900/30 border border-red-600/30 text-red-400'
                        }`}>
                            {subscription.status === 'active' ? t.statusActive : 
                             subscription.status === 'expired' ? t.statusExpired : t.statusCancelled}
                        </span>
                    </div>
                    
                    {subscription.plan && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-lg font-medium text-white mb-2">
                                    {subscription.plan.name} Plan
                                    {subscription.plan.price > 0 && (
                                        <span className="ml-2 text-sky-400">
                                            ₩{subscription.plan.price.toLocaleString()}{subscription.plan.duration === 'monthly' ? t.month : t.year}
                                        </span>
                                    )}
                                </h4>
                                <p className="text-slate-400 mb-4">{subscription.plan.description}</p>
                                
                                {subscription.expiresAt && (
                                    <p className="text-sm text-slate-400">
                                        {subscription.autoRenew ? t.renewsOn : t.expiresOn}: {' '}
                                        {new Date(subscription.expiresAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            
                            <div>
                                <h5 className="font-medium text-white mb-3">{t.usage}</h5>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">{t.usageMessages}</span>
                                        <span className="text-white">
                                            {subscription.usage.messages}/{subscription.limits.messages}
                                            {subscription.limits.messages - subscription.usage.messages > 0 && (
                                                <span className="text-green-400 ml-1">
                                                    ({subscription.limits.messages - subscription.usage.messages} {t.remaining})
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    
                                    {subscription.limits.legalNotary > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">{t.usageNotary}</span>
                                            <span className="text-white">
                                                {subscription.usage.legalNotary}/{subscription.limits.legalNotary}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex gap-3 mt-6">
                        {subscription.status === 'active' && subscription.plan?.name !== 'Pro' && (
                            <button
                                onClick={() => setSelectedPlan(plans.find(p => p.name === 'Premium') || null)}
                                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
                            >
                                {t.upgradeNow}
                            </button>
                        )}
                        
                        {subscription.status === 'active' && subscription.plan?.price > 0 && (
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                            >
                                {t.cancel}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* 사용 가능한 플랜들 */}
            <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        t={t}
                        isCurrentPlan={subscription?.plan?.id === plan.id}
                        onSelect={() => handleUpgrade(plan)}
                        disabled={loading}
                    />
                ))}
            </div>
        </div>
    );
};

// 플랜 카드 컴포넌트
const PlanCard: React.FC<{
    plan: SubscriptionPlan;
    t: any;
    isCurrentPlan: boolean;
    onSelect: () => void;
    disabled: boolean;
}> = ({ plan, t, isCurrentPlan, onSelect, disabled }) => {
    const isFreePlan = plan.price === 0;
    const isLifetimePlan = plan.name === 'Lifetime';
    const originalPrice = isLifetimePlan ? 2000000 : 0; // 200만원 원가
    
    return (
        <div className={`relative bg-slate-800/50 border rounded-xl p-6 transition-all hover:border-sky-500/50 ${
            plan.recommended ? 'border-sky-500/50 ring-1 ring-sky-500/20' : 
            isLifetimePlan ? 'border-purple-500/50 ring-1 ring-purple-500/20' :
            'border-slate-700'
        }`}>
            {/* 추천 배지 */}
            {plan.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-sky-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        {t.recommended}
                    </span>
                </div>
            )}
            
            {/* Lifetime 특별 배지 */}
            {isLifetimePlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                        ⭐ LIFETIME
                    </span>
                </div>
            )}
            
            <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-2">
                    {isFreePlan ? (
                        <StarIcon className="w-8 h-8 text-amber-400" />
                    ) : plan.name === 'Pro' ? (
                        <CrownIcon className="w-8 h-8 text-purple-400" />
                    ) : (
                        <SparklesIcon className="w-8 h-8 text-sky-400" />
                    )}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
                
                <div className="mb-4">
                    {isFreePlan ? (
                        <div className="text-3xl font-bold text-white">{t.free}</div>
                    ) : isLifetimePlan ? (
                        <div>
                            <div className="text-lg line-through text-slate-500 mb-1">
                                ₩{originalPrice.toLocaleString()}
                            </div>
                            <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                ₩{plan.price.toLocaleString()}
                            </span>
                            <div className="text-green-400 text-sm mt-1 font-semibold">
                                30% 할인 (60만원 절약!)
                            </div>
                            <div className="text-slate-400 text-sm">
                                평생 사용
                            </div>
                        </div>
                    ) : (
                        <div>
                            <span className="text-3xl font-bold text-white">
                                ₩{plan.price.toLocaleString()}
                            </span>
                            <span className="text-slate-400">
                                {plan.duration === 'monthly' ? t.month : t.year}
                            </span>
                            {plan.duration === 'yearly' && (
                                <div className="text-green-400 text-sm mt-1">{t.save}</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {/* 기능 목록 */}
            <div className="space-y-3 mb-6">
                <h4 className="font-medium text-white text-sm">{t.features}:</h4>
                <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <span className="text-slate-300">{feature}</span>
                        </li>
                    ))}
                    <li className="flex items-center gap-2 text-sm">
                        <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-slate-300">
                            {plan.maxMessages === 999 ? t.unlimited : plan.maxMessages} {t.basicMessage}
                        </span>
                    </li>
                </ul>
            </div>
            
            {/* 액션 버튼 */}
            <button
                onClick={onSelect}
                disabled={disabled || isCurrentPlan}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isCurrentPlan
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        : plan.recommended
                        ? 'bg-sky-600 hover:bg-sky-700 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
            >
                {isCurrentPlan ? t.currentPlan : isFreePlan ? t.free : t.upgradeNow}
            </button>
        </div>
    );
};