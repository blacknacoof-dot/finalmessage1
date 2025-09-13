import React, { useState } from 'react';
import PricingPlans from '../components/PricingPlans';
import { ArrowLeft } from 'lucide-react';
import type { Language } from '../App';

interface PricingProps {
  language: Language;
  onBack?: () => void;
  onSelectPlan?: (planId: number) => void;
  currentPlanId?: number;
}

export default function Pricing({ language, onBack, onSelectPlan, currentPlanId }: PricingProps) {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  const handleSelectPlan = (planId: number) => {
    setSelectedPlan(planId);
    onSelectPlan?.(planId);
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'ko' ? '뒤로 가기' : 'Back'}</span>
          </button>
        )}

        <PricingPlans 
          onSelectPlan={handleSelectPlan}
          currentPlanId={currentPlanId}
        />
      </div>
    </div>
  );
}