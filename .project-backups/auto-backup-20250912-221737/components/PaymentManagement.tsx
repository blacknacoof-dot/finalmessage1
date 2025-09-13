import React, { useState } from 'react';
import { User } from '../types';
import { CreditCardIcon, CalendarIcon, DocumentDuplicateIcon, ChevronDownIcon, ChevronUpIcon } from '../components/icons';

interface PaymentHistoryItem {
  id: string;
  date: string;
  amount: string;
  plan: string;
  method: string;
  status: 'success' | 'pending' | 'failed';
  invoice?: string;
}

interface PaymentManagementProps {
  user: User;
  language: 'en' | 'ko';
  onUpgrade: (plan: 'Monthly' | 'Annual' | 'Lifetime') => void;
  onCancelSubscription: () => void;
  onChangePlan: () => void;
}

const PaymentManagement: React.FC<PaymentManagementProps> = ({
  user,
  language,
  onUpgrade,
  onCancelSubscription,
  onChangePlan
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [showCancellation, setShowCancellation] = useState(false);

  const t = language === 'ko' ? {
    paymentManagement: '결제 관리',
    currentPlan: '현재 요금제',
    freePlan: '무료 플랜',
    premiumPlan: '프리미엄 플랜',
    monthlyPlan: '월간 요금제',
    annualPlan: '연간 요금제', 
    lifetimePlan: '평생 요금제',
    nextPayment: '다음 결제일',
    paymentMethod: '결제 수단',
    changePlan: '요금제 변경',
    cancelSubscription: '구독 해지',
    paymentHistory: '결제 내역',
    viewHistory: '내역 보기',
    hideHistory: '내역 숨기기',
    downloadInvoice: '영수증 다운로드',
    subscriptionStatus: '구독 상태',
    active: '활성',
    inactive: '비활성',
    cancelled: '해지됨',
    expired: '만료됨',
    upgradeNow: '지금 업그레이드',
    manageSubscription: '구독 관리',
    confirmCancellation: '구독 해지 확인',
    cancellationWarning: '구독을 해지하시겠습니까? 해지 시 프리미엄 기능을 더 이상 사용할 수 없습니다.',
    confirmCancel: '해지하기',
    keepSubscription: '유지하기',
    billingCycle: '결제 주기',
    subscriptionDate: '구독 시작일',
    autoRenewal: '자동 갱신',
    enabled: '활성화',
    disabled: '비활성화',
    paymentFailed: '결제 실패',
    updatePaymentMethod: '결제 수단 변경'
  } : {
    paymentManagement: 'Payment Management',
    currentPlan: 'Current Plan',
    freePlan: 'Free Plan', 
    premiumPlan: 'Premium Plan',
    monthlyPlan: 'Monthly Plan',
    annualPlan: 'Annual Plan',
    lifetimePlan: 'Lifetime Plan',
    nextPayment: 'Next Payment',
    paymentMethod: 'Payment Method',
    changePlan: 'Change Plan',
    cancelSubscription: 'Cancel Subscription',
    paymentHistory: 'Payment History',
    viewHistory: 'View History',
    hideHistory: 'Hide History',
    downloadInvoice: 'Download Invoice',
    subscriptionStatus: 'Subscription Status',
    active: 'Active',
    inactive: 'Inactive',
    cancelled: 'Cancelled',
    expired: 'Expired',
    upgradeNow: 'Upgrade Now',
    manageSubscription: 'Manage Subscription',
    confirmCancellation: 'Confirm Cancellation',
    cancellationWarning: 'Are you sure you want to cancel your subscription? You will lose access to premium features.',
    confirmCancel: 'Cancel Subscription',
    keepSubscription: 'Keep Subscription',
    billingCycle: 'Billing Cycle',
    subscriptionDate: 'Subscription Date',
    autoRenewal: 'Auto Renewal',
    enabled: 'Enabled',
    disabled: 'Disabled',
    paymentFailed: 'Payment Failed',
    updatePaymentMethod: 'Update Payment Method'
  };

  // Mock payment history
  const paymentHistory: PaymentHistoryItem[] = [
    {
      id: '1',
      date: '2024-12-01',
      amount: language === 'ko' ? '15,000원' : '$15.00',
      plan: t.monthlyPlan,
      method: '**** **** **** 1234',
      status: 'success',
      invoice: 'INV-2024-001'
    },
    {
      id: '2', 
      date: '2024-11-01',
      amount: language === 'ko' ? '15,000원' : '$15.00',
      plan: t.monthlyPlan,
      method: '**** **** **** 1234',
      status: 'success',
      invoice: 'INV-2024-002'
    },
    {
      id: '3',
      date: '2024-10-01', 
      amount: language === 'ko' ? '15,000원' : '$15.00',
      plan: t.monthlyPlan,
      method: '**** **** **** 1234',
      status: 'failed'
    }
  ];

  const getStatusColor = (status: PaymentHistoryItem['status']) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusText = (status: PaymentHistoryItem['status']) => {
    const statusMap = language === 'ko' ? {
      success: '성공',
      pending: '대기중',
      failed: '실패'
    } : {
      success: 'Success',
      pending: 'Pending', 
      failed: 'Failed'
    };
    return statusMap[status];
  };

  const getPlanTitle = () => {
    if (user.plan === 'Free') return t.freePlan;
    if (user.subscription?.planType === 'Monthly') return t.monthlyPlan;
    if (user.subscription?.planType === 'Annual') return t.annualPlan;
    if (user.subscription?.planType === 'Lifetime') return t.lifetimePlan;
    return t.premiumPlan;
  };

  return (
    <div className="bg-slate-900/70 p-6 rounded-lg border border-slate-700">
      <h3 className="font-semibold text-lg text-white mb-6 flex items-center gap-2">
        <CreditCardIcon className="w-5 h-5" />
        {t.paymentManagement}
      </h3>
      
      {/* Current Plan Section */}
      <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-slate-400 text-sm">{t.currentPlan}</p>
            <p className="font-bold text-white text-lg">{getPlanTitle()}</p>
            {user.plan === 'Premium' && user.subscription && (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-slate-400">
                  {t.subscriptionStatus}: <span className="text-green-400">{t.active}</span>
                </p>
                {user.subscription.planType !== 'Lifetime' && (
                  <p className="text-sm text-slate-400">
                    <CalendarIcon className="w-4 h-4 inline mr-1" />
                    {t.nextPayment}: {user.subscription.nextPaymentDate}
                  </p>
                )}
                <p className="text-sm text-slate-400">
                  {t.subscriptionDate}: {user.subscription.startDate || '2024-01-01'}
                </p>
              </div>
            )}
          </div>
          <div className="text-right">
            {user.plan === 'Free' ? (
              <button 
                onClick={() => onUpgrade('Monthly')}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md transition-colors text-sm font-semibold"
              >
                {t.upgradeNow}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={onChangePlan}
                  className="px-3 py-1 text-sm text-sky-400 hover:text-sky-300 font-semibold border border-sky-400/30 rounded-md hover:border-sky-300/50 transition-colors"
                >
                  {t.changePlan}
                </button>
                {user.subscription?.planType !== 'Lifetime' && (
                  <button
                    onClick={() => setShowCancellation(true)}
                    className="px-3 py-1 text-sm text-red-400 hover:text-red-300 font-semibold border border-red-400/30 rounded-md hover:border-red-300/50 transition-colors"
                  >
                    {t.cancelSubscription}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Payment Method & Billing Info */}
        {user.plan === 'Premium' && user.subscription && (
          <div className="border-t border-slate-700 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">{t.paymentMethod}</p>
                <p className="font-semibold text-slate-300">
                  {user.subscription.paymentMethod.details}
                </p>
              </div>
              <div>
                <p className="text-slate-400">{t.autoRenewal}</p>
                <p className="font-semibold text-slate-300">
                  {user.subscription.autoRenewal !== false ? t.enabled : t.disabled}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment History Section */}
      {user.plan === 'Premium' && (
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex justify-between items-center text-left"
          >
            <h4 className="font-semibold text-white">{t.paymentHistory}</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">
                {showHistory ? t.hideHistory : t.viewHistory}
              </span>
              {showHistory ? (
                <ChevronUpIcon className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </button>
          
          {showHistory && (
            <div className="mt-4 space-y-3">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-md">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-white">{payment.amount}</p>
                      <p className={`text-sm font-semibold ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </p>
                    </div>
                    <p className="text-sm text-slate-400">{payment.date} • {payment.plan}</p>
                    <p className="text-xs text-slate-500">{payment.method}</p>
                  </div>
                  {payment.invoice && payment.status === 'success' && (
                    <button className="ml-4 p-2 text-slate-400 hover:text-white transition-colors">
                      <DocumentDuplicateIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {showCancellation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-slate-700">
            <h3 className="font-semibold text-lg text-white mb-4">{t.confirmCancellation}</h3>
            <p className="text-slate-300 mb-6">{t.cancellationWarning}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancellation(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                {t.keepSubscription}
              </button>
              <button
                onClick={() => {
                  onCancelSubscription();
                  setShowCancellation(false);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                {t.confirmCancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;