import { User } from '../types';

// 플랜 관련 유틸리티 함수들
export const planUtils = {
  // 기능 접근 가능 여부 (무료 플랜도 모든 기능 접근 가능)
  canAccess: (feature: string): boolean => {
    return true; // 모든 기능에 접근 가능
  },

  // 기능 실행 가능 여부 (유료 플랜에서만 실제 실행)
  canExecute: (user: User, feature: string): { allowed: boolean; reason?: string } => {
    if (user.plan === 'Premium') {
      return { allowed: true };
    }

    const messages = {
      ko: {
        delivery: '실제 메시지 전달은 프리미엄 플랜에서만 가능합니다.',
        multimedia: '멀티미디어 저장 및 전달은 프리미엄 플랜에서만 가능합니다.',
        assets: '자산 보안 저장 및 전달은 프리미엄 플랜에서만 가능합니다.',
        successors: '상속자에게 실제 전달은 프리미엄 플랜에서만 가능합니다.',
        notary: '법적 공증 기능은 프리미엄 플랜에서만 가능합니다.',
        aiGeneration: 'AI 메시지 생성은 프리미엄 플랜에서만 가능합니다.',
        verification: '블록체인 검증은 프리미엄 플랜에서만 가능합니다.'
      },
      en: {
        delivery: 'Actual message delivery is only available in Premium plan.',
        multimedia: 'Multimedia storage and delivery is only available in Premium plan.',
        assets: 'Secure asset storage and delivery is only available in Premium plan.',
        successors: 'Actual delivery to successors is only available in Premium plan.',
        notary: 'Legal notarization is only available in Premium plan.',
        aiGeneration: 'AI message generation is only available in Premium plan.',
        verification: 'Blockchain verification is only available in Premium plan.'
      }
    };

    return {
      allowed: false,
      reason: messages.ko[feature as keyof typeof messages.ko] || '이 기능은 프리미엄 플랜에서만 사용할 수 있습니다.'
    };
  },

  // 프리미엄 기능 표시 여부
  showPremiumBadge: (user: User): boolean => {
    return user.plan === 'Free';
  },

  // 기능별 제한 사항 설명
  getFeatureDescription: (user: User, feature: string, language: 'ko' | 'en' = 'ko') => {
    if (user.plan === 'Premium') {
      return null; // 프리미엄 사용자는 제한 없음
    }

    const descriptions = {
      ko: {
        message: '메시지를 작성하고 저장할 수 있지만, 실제 전달은 프리미엄 플랜에서만 가능합니다.',
        multimedia: '멀티미디어를 업로드하고 미리보기할 수 있지만, 저장 및 전달은 프리미엄 플랜에서만 가능합니다.',
        assets: '자산 정보를 입력하고 관리할 수 있지만, 보안 저장 및 전달은 프리미엄 플랜에서만 가능합니다.',
        successors: '상속자를 지정하고 관리할 수 있지만, 실제 전달은 프리미엄 플랜에서만 가능합니다.',
        settings: '모든 설정을 확인하고 구성할 수 있지만, 자동 전달 시스템은 프리미엄 플랜에서만 작동합니다.'
      },
      en: {
        message: 'You can write and save messages, but actual delivery is only available in Premium plan.',
        multimedia: 'You can upload and preview multimedia, but storage and delivery is only available in Premium plan.',
        assets: 'You can enter and manage asset information, but secure storage and delivery is only available in Premium plan.',
        successors: 'You can designate and manage successors, but actual delivery is only available in Premium plan.',
        settings: 'You can view and configure all settings, but the automatic delivery system only works in Premium plan.'
      }
    };

    return descriptions[language][feature as keyof typeof descriptions[typeof language]];
  },

  // 업그레이드 유도 메시지
  getUpgradeMessage: (language: 'ko' | 'en' = 'ko') => {
    return language === 'ko' 
      ? '지금 프리미엄으로 업그레이드하여 모든 기능을 활성화하세요!'
      : 'Upgrade to Premium now to activate all features!';
  }
};

export default planUtils;