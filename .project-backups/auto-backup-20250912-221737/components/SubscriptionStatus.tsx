import React, { useState, useEffect } from 'react';
import { Crown, AlertTriangle, CheckCircle, Lock } from 'lucide-react';

interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  currency: string;
  features: any;
  legalNotary: boolean;
}

interface SubscriptionData {
  plan: SubscriptionPlan | null;
  status: string;
  expiresAt: string | null;
  canUseLegalNotary: boolean;
  remainingMessages: number;
  usage: Array<{
    feature_name: string;
    usage_count: number;
    limit: number;
  }>;
}

interface SubscriptionStatusProps {
  onUpgrade?: () => void;
}

export default function SubscriptionStatus({ onUpgrade }: SubscriptionStatusProps) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('인증이 필요합니다');
        return;
      }

      const response = await fetch('http://localhost:3002/api/subscription/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('구독 정보를 가져올 수 없습니다');
      }

      const data = await response.json();
      setSubscription(data.subscription);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
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

  if (!subscription) {
    return null;
  }

  const isPremium = subscription.plan?.name === 'Premium';
  const isFree = !subscription.plan || subscription.plan.name === 'Free';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">구독 현황</h3>
        {isPremium && (
          <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
            <Crown className="w-4 h-4" />
            <span>Premium</span>
          </div>
        )}
      </div>

      {/* 플랜 정보 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">현재 플랜</span>
          <span className="font-medium">
            {subscription.plan?.name || 'Free'} 
            {subscription.plan && subscription.plan.price > 0 && (
              <span className="text-gray-500 ml-1">
                (₩{subscription.plan.price.toLocaleString()}/월)
              </span>
            )}
          </span>
        </div>
        
        {subscription.expiresAt && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600">만료일</span>
            <span className="font-medium">
              {new Date(subscription.expiresAt).toLocaleDateString('ko-KR')}
            </span>
          </div>
        )}
      </div>

      {/* 메시지 사용량 */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-gray-900">이번 달 사용량</h4>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">메시지 발송</span>
            <span className="text-sm font-medium">
              {subscription.usage[0]?.usage_count || 0} / {subscription.usage[0]?.limit || (isFree ? 3 : 50)}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min(100, ((subscription.usage[0]?.usage_count || 0) / (subscription.usage[0]?.limit || (isFree ? 3 : 50))) * 100)}%` 
              }}
            />
          </div>
          
          <div className="text-sm text-gray-500">
            {subscription.remainingMessages}개 남음
          </div>
        </div>
      </div>

      {/* 법적 공증 기능 */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {subscription.canUseLegalNotary ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Lock className="w-5 h-5 text-gray-400" />
            )}
            <span className="text-gray-900">법적 공증 기능</span>
          </div>
          
          {subscription.canUseLegalNotary ? (
            <span className="text-green-600 text-sm font-medium">사용 가능</span>
          ) : (
            <span className="text-gray-500 text-sm">Premium 필요</span>
          )}
        </div>
        
        {!subscription.canUseLegalNotary && (
          <p className="text-sm text-gray-500 mt-1">
            법적 효력이 있는 메시지를 보내려면 Premium 구독이 필요합니다.
          </p>
        )}
      </div>

      {/* 업그레이드 버튼 */}
      {isFree && (
        <div className="pt-4 border-t">
          <button
            onClick={onUpgrade}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Premium으로 업그레이드 - ₩15,000/월
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            무제한 메시지 발송 + 법적 공증 기능 사용 가능
          </p>
        </div>
      )}

      {/* 사용량 초과 경고 */}
      {subscription.remainingMessages <= 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="font-medium">메시지 한도 초과</p>
              <p className="text-sm">이번 달 메시지 발송 한도를 모두 사용했습니다.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}