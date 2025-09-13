import pool from '../database/connection';

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  features: any;
  max_messages: number;
  legal_notary: boolean;
  is_active: boolean;
}

export interface UserSubscription {
  id: number;
  user_id: number;
  plan_id: number;
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  started_at: Date;
  expires_at: Date;
  auto_renew: boolean;
}

export interface FeatureUsage {
  user_id: number;
  feature_name: string;
  usage_count: number;
  limit: number;
  reset_date: Date;
}

export class SubscriptionService {
  // 모든 활성 요금제 조회
  static async getActivePlans(): Promise<SubscriptionPlan[]> {
    const result = await pool.query(
      'SELECT * FROM subscription_plans WHERE is_active = true ORDER BY price ASC'
    );
    return result.rows;
  }

  // 특정 요금제 조회
  static async getPlanById(planId: number): Promise<SubscriptionPlan | null> {
    const result = await pool.query(
      'SELECT * FROM subscription_plans WHERE id = $1 AND is_active = true',
      [planId]
    );
    return result.rows[0] || null;
  }

  // 사용자의 현재 구독 조회
  static async getUserSubscription(userId: number): Promise<UserSubscription | null> {
    const result = await pool.query(
      `SELECT us.*, sp.name as plan_name, sp.features, sp.legal_notary, sp.max_messages
       FROM user_subscriptions us
       JOIN subscription_plans sp ON us.plan_id = sp.id
       WHERE us.user_id = $1 AND us.status = 'active' AND us.expires_at > NOW()
       ORDER BY us.expires_at DESC LIMIT 1`,
      [userId]
    );
    return result.rows[0] || null;
  }

  // 구독 생성
  static async createSubscription(
    userId: number,
    planId: number,
    paymentId?: number
  ): Promise<UserSubscription> {
    const plan = await this.getPlanById(planId);
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

    const result = await pool.query(
      `INSERT INTO user_subscriptions (user_id, plan_id, expires_at, payment_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, planId, expiresAt, paymentId]
    );

    return result.rows[0];
  }

  // 구독 취소
  static async cancelSubscription(userId: number): Promise<boolean> {
    const result = await pool.query(
      `UPDATE user_subscriptions 
       SET status = 'cancelled', cancelled_at = NOW(), auto_renew = false
       WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );

    return (result.rowCount || 0) > 0;
  }

  // 기능 사용 가능 여부 확인
  static async canUseFeature(userId: number, featureName: string): Promise<{
    allowed: boolean;
    reason?: string;
    usage?: FeatureUsage;
  }> {
    const subscription = await this.getUserSubscription(userId);
    
    if (!subscription) {
      // 무료 플랜 사용자
      return await this.checkFreeUserFeature(userId, featureName);
    }

    const plan = await this.getPlanById(subscription.plan_id);
    if (!plan) {
      return { allowed: false, reason: 'Invalid subscription plan' };
    }

    // 법적 공증 기능 확인
    if (featureName === 'legal_notary' && !plan.legal_notary) {
      return { 
        allowed: false, 
        reason: 'Legal notary feature requires Premium subscription (₩15,000/month)' 
      };
    }

    // 메시지 전송 제한 확인
    if (featureName === 'message_send') {
      const usage = await this.getFeatureUsage(userId, 'message_send');
      if (usage.usage_count >= plan.max_messages) {
        return { 
          allowed: false, 
          reason: `Monthly message limit (${plan.max_messages}) exceeded`,
          usage 
        };
      }
      return { allowed: true, usage };
    }

    // 기본적으로 프리미엄 기능은 허용
    return { allowed: true };
  }

  // 무료 사용자 기능 확인
  static async checkFreeUserFeature(userId: number, featureName: string): Promise<{
    allowed: boolean;
    reason?: string;
    usage?: FeatureUsage;
  }> {
    if (featureName === 'legal_notary') {
      return { 
        allowed: false, 
        reason: 'Legal notary feature requires Premium subscription (₩15,000/month)' 
      };
    }

    if (featureName === 'message_send') {
      const usage = await this.getFeatureUsage(userId, 'message_send');
      const freeLimit = 3; // 무료 사용자는 월 3개까지

      if (usage.usage_count >= freeLimit) {
        return { 
          allowed: false, 
          reason: `Free plan limit (${freeLimit} messages/month) exceeded. Upgrade to Premium for unlimited messages.`,
          usage 
        };
      }
      return { allowed: true, usage };
    }

    return { allowed: true };
  }

  // 기능 사용량 조회
  static async getFeatureUsage(userId: number, featureName: string): Promise<FeatureUsage> {
    const currentMonth = new Date();
    currentMonth.setDate(1); // 이번 달 1일
    currentMonth.setHours(0, 0, 0, 0);

    let result = await pool.query(
      `SELECT * FROM feature_usage 
       WHERE user_id = $1 AND feature_name = $2 AND reset_date >= $3`,
      [userId, featureName, currentMonth]
    );

    if (result.rows.length === 0) {
      // 이번 달 사용량 기록이 없으면 새로 생성
      await pool.query(
        `INSERT INTO feature_usage (user_id, feature_name, usage_count, reset_date)
         VALUES ($1, $2, 0, $3)`,
        [userId, featureName, currentMonth]
      );

      result = await pool.query(
        `SELECT * FROM feature_usage 
         WHERE user_id = $1 AND feature_name = $2 AND reset_date >= $3`,
        [userId, featureName, currentMonth]
      );
    }

    const usage = result.rows[0];
    const subscription = await this.getUserSubscription(userId);
    const limit = subscription 
      ? (await this.getPlanById(subscription.plan_id))?.max_messages || 0
      : 3; // 무료 플랜 제한

    return {
      user_id: usage.user_id,
      feature_name: usage.feature_name,
      usage_count: usage.usage_count,
      limit,
      reset_date: usage.reset_date
    };
  }

  // 기능 사용량 증가
  static async incrementFeatureUsage(userId: number, featureName: string): Promise<void> {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    await pool.query(
      `INSERT INTO feature_usage (user_id, feature_name, usage_count, reset_date)
       VALUES ($1, $2, 1, $3)
       ON CONFLICT (user_id, feature_name, reset_date) 
       DO UPDATE SET usage_count = feature_usage.usage_count + 1`,
      [userId, featureName, currentMonth]
    );
  }

  // 만료된 구독 처리
  static async processExpiredSubscriptions(): Promise<void> {
    await pool.query(
      `UPDATE user_subscriptions 
       SET status = 'expired' 
       WHERE status = 'active' AND expires_at <= NOW()`
    );
  }

  // 사용자 구독 상태 요약
  static async getUserSubscriptionSummary(userId: number): Promise<{
    subscription: UserSubscription | null;
    plan: SubscriptionPlan | null;
    usage: FeatureUsage[];
    canUseLegalNotary: boolean;
    remainingMessages: number;
  }> {
    const subscription = await this.getUserSubscription(userId);
    const plan = subscription ? await this.getPlanById(subscription.plan_id) : null;
    
    const messageUsage = await this.getFeatureUsage(userId, 'message_send');
    const legalNotaryCheck = await this.canUseFeature(userId, 'legal_notary');
    
    const remainingMessages = plan 
      ? Math.max(0, plan.max_messages - messageUsage.usage_count)
      : Math.max(0, 3 - messageUsage.usage_count); // 무료 플랜

    return {
      subscription,
      plan,
      usage: [messageUsage],
      canUseLegalNotary: legalNotaryCheck.allowed,
      remainingMessages
    };
  }
}