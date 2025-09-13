import React, { useState, useEffect } from 'react';
import { Check, Crown, Star, AlertTriangle } from 'lucide-react';

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: string;
  features: any;
  maxMessages: number;
  legalNotary: boolean;
  recommended?: boolean;
}

interface PricingPlansProps {
  onSelectPlan?: (planId: number) => void;
  currentPlanId?: number;
}

export default function PricingPlans({ onSelectPlan, currentPlanId }: PricingPlansProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('인증이 필요합니다');
        return;
      }

      const response = await fetch('http://localhost:3002/api/subscription/plans', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('요금제 정보를 가져올 수 없습니다');
      }

      const data = await response.json();
      setPlans(data.plans);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId: number) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    setSelectedPlan(planId);

    if (plan.price === 0) {
      // 무료 플랜은 즉시 구독 처리
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:3002/api/subscription/subscribe', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ planId }),
        });

        if (response.ok) {
          alert('무료 플랜으로 변경되었습니다!');
          onSelectPlan?.(planId);
        } else {
          const error = await response.json();
          alert(error.error || '구독 변경에 실패했습니다.');
        }
      } catch (error) {
        alert('구독 변경 중 오류가 발생했습니다.');
      }
    } else {
      // 유료 플랜은 결제 필요
      onSelectPlan?.(planId);
    }

    setSelectedPlan(null);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 text-red-700">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">요금제 선택</h2>
        <p className="text-lg text-gray-600">
          메시지의 영원함을 보장하는 다양한 플랜을 제공합니다
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div
            key={plan.id}
            className={`
              relative bg-white rounded-lg shadow-md border-2 transition-all duration-200 hover:shadow-lg
              ${plan.recommended ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}
              ${currentPlanId === plan.id ? 'bg-blue-50' : ''}
            `}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>추천</span>
                </div>
              </div>
            )}

            <div className="p-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {plan.name === 'Premium' && <Crown className="w-5 h-5 text-yellow-500" />}
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                </div>
                <p className="text-gray-600 text-sm">{plan.description}</p>
                
                <div className="mt-4">
                  {plan.price === 0 ? (
                    <div className="text-2xl font-bold text-green-600">무료</div>
                  ) : (
                    <div>
                      <div className="text-3xl font-bold text-gray-900">
                        ₩{plan.price.toLocaleString()}
                      </div>
                      <div className="text-gray-500 text-sm">
                        / {plan.duration === 'monthly' ? '월' : '년'}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    월 {plan.maxMessages}개 메시지 발송
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">블록체인 해시 검증</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">이메일 자동 발송</span>
                </div>
                
                {plan.legalNotary ? (
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">법적 공증 기능</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-gray-400">
                    <div className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"></div>
                    <span className="text-sm line-through">법적 공증 기능</span>
                  </div>
                )}
                
                {plan.name !== 'Free' && (
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">우선 고객 지원</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={selectedPlan === plan.id || currentPlanId === plan.id}
                className={`
                  w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200
                  ${currentPlanId === plan.id 
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-300' 
                    : plan.recommended
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }
                  ${selectedPlan === plan.id ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {selectedPlan === plan.id ? (
                  '처리중...'
                ) : currentPlanId === plan.id ? (
                  '현재 플랜'
                ) : plan.price === 0 ? (
                  '무료로 시작하기'
                ) : (
                  `${plan.name} 선택하기`
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>모든 플랜은 언제든지 변경 가능합니다 • 법적 공증은 Premium 이상에서만 사용 가능합니다</p>
      </div>
    </div>
  );
}