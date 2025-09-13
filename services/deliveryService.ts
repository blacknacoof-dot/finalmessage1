import { User } from '../types';
import { planUtils } from '../utils/planUtils';

export interface DeliveryAttempt {
  id: string;
  userId: string;
  messageId?: string;
  recipientEmail: string;
  attemptedAt: string;
  status: 'pending' | 'delivered' | 'failed' | 'blocked';
  reason?: string;
  deliveryType: 'manual' | 'automatic' | 'scheduled';
}

export class DeliveryService {
  // 메시지 전달 가능 여부 검증
  static canDeliver(user: User, deliveryType: 'manual' | 'automatic' | 'scheduled' = 'manual'): { allowed: boolean; reason?: string } {
    const executionCheck = planUtils.canExecute(user, 'delivery');
    
    if (!executionCheck.allowed) {
      return {
        allowed: false,
        reason: '메시지 전달 기능은 프리미엄 플랜에서만 사용할 수 있습니다. 지금 업그레이드하여 소중한 메시지를 안전하게 전달하세요.'
      };
    }

    // 구독 상태 확인
    if (user.plan === 'Premium' && user.subscription) {
      if (user.subscription.planType !== 'Lifetime') {
        const now = new Date();
        const nextPayment = new Date(user.subscription.nextPaymentDate);
        
        // 다음 결제일이 지났는지 확인
        if (now > nextPayment) {
          return {
            allowed: false,
            reason: '구독이 만료되었습니다. 결제를 완료한 후 메시지 전달이 가능합니다.'
          };
        }
      }
    }

    return { allowed: true };
  }

  // 자동 전달 시스템 활성화 검증
  static canActivateAutoDelivery(user: User): { allowed: boolean; reason?: string } {
    const deliveryCheck = this.canDeliver(user, 'automatic');
    
    if (!deliveryCheck.allowed) {
      return deliveryCheck;
    }

    // 상속자가 지정되어 있는지 확인
    const successors = JSON.parse(localStorage.getItem('finalmessage_verifiers') || '[]');
    if (successors.length === 0) {
      return {
        allowed: false,
        reason: '자동 전달을 활성화하려면 최소 1명의 상속자를 지정해야 합니다.'
      };
    }

    return { allowed: true };
  }

  // 전달 시도 기록
  static async attemptDelivery(
    user: User, 
    recipientEmail: string, 
    messageId?: string,
    deliveryType: 'manual' | 'automatic' | 'scheduled' = 'manual'
  ): Promise<DeliveryAttempt> {
    const canDeliverCheck = this.canDeliver(user, deliveryType);
    
    const attempt: DeliveryAttempt = {
      id: `delivery_${Date.now()}`,
      userId: user.email,
      messageId,
      recipientEmail,
      attemptedAt: new Date().toISOString(),
      status: canDeliverCheck.allowed ? 'pending' : 'blocked',
      reason: canDeliverCheck.reason,
      deliveryType
    };

    if (!canDeliverCheck.allowed) {
      // 전달 차단 로그 저장
      this.saveDeliveryAttempt(attempt);
      throw new Error(canDeliverCheck.reason);
    }

    // 실제 전달 로직 (시뮬레이션)
    try {
      // 프리미엄 플랜에서만 실제 전달 수행
      await this.performDelivery(user, recipientEmail, messageId);
      attempt.status = 'delivered';
    } catch (error) {
      attempt.status = 'failed';
      attempt.reason = error instanceof Error ? error.message : '전달 실패';
    }

    this.saveDeliveryAttempt(attempt);
    return attempt;
  }

  // 실제 전달 수행 (시뮬레이션)
  private static async performDelivery(user: User, recipientEmail: string, messageId?: string): Promise<void> {
    // 실제 구현에서는 이메일 서비스, SMS 등을 통해 전달
    console.log(`[Delivery] Sending message to ${recipientEmail} from ${user.email}`);
    
    // 시뮬레이션: 2초 대기
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 90% 성공률로 시뮬레이션
    if (Math.random() < 0.1) {
      throw new Error('네트워크 오류로 인한 전달 실패');
    }
    
    console.log(`[Delivery] Successfully delivered to ${recipientEmail}`);
  }

  // 전달 시도 기록 저장
  private static saveDeliveryAttempt(attempt: DeliveryAttempt): void {
    const key = 'finalmessage_delivery_attempts';
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');
    attempts.unshift(attempt);
    
    // 최대 100개 기록만 유지
    localStorage.setItem(key, JSON.stringify(attempts.slice(0, 100)));
  }

  // 전달 기록 조회
  static getDeliveryHistory(userId: string): DeliveryAttempt[] {
    const key = 'finalmessage_delivery_attempts';
    const attempts = JSON.parse(localStorage.getItem(key) || '[]');
    return attempts.filter((attempt: DeliveryAttempt) => attempt.userId === userId);
  }

  // 전달 통계
  static getDeliveryStats(userId: string): {
    total: number;
    delivered: number;
    failed: number;
    blocked: number;
    successRate: number;
  } {
    const history = this.getDeliveryHistory(userId);
    
    const stats = {
      total: history.length,
      delivered: history.filter(h => h.status === 'delivered').length,
      failed: history.filter(h => h.status === 'failed').length,
      blocked: history.filter(h => h.status === 'blocked').length,
      successRate: 0
    };

    const deliveryAttempts = stats.delivered + stats.failed;
    stats.successRate = deliveryAttempts > 0 ? (stats.delivered / deliveryAttempts) * 100 : 0;

    return stats;
  }
}

export default DeliveryService;