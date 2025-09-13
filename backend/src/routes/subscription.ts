import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { SubscriptionService } from '../services/subscriptionService';

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 사용 가능한 요금제 조회
router.get('/plans', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const plans = await SubscriptionService.getActivePlans();
    
    res.json({
      success: true,
      plans: plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        currency: plan.currency,
        duration: plan.duration_days === 30 ? 'monthly' : 'yearly',
        features: plan.features,
        maxMessages: plan.max_messages,
        legalNotary: plan.legal_notary,
        recommended: plan.name === 'Premium' // 프리미엄 플랜을 추천으로 표시
      }))
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 사용자 구독 상태 조회
router.get('/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId!;
    const summary = await SubscriptionService.getUserSubscriptionSummary(userId);
    
    res.json({
      success: true,
      subscription: {
        plan: summary.plan ? {
          id: summary.plan.id,
          name: summary.plan.name,
          price: summary.plan.price,
          currency: summary.plan.currency,
          features: summary.plan.features,
          legalNotary: summary.plan.legal_notary
        } : null,
        status: summary.subscription?.status || 'none',
        expiresAt: summary.subscription?.expires_at,
        autoRenew: summary.subscription?.auto_renew,
        canUseLegalNotary: summary.canUseLegalNotary,
        remainingMessages: summary.remainingMessages,
        usage: summary.usage
      }
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 구독 생성 (결제 후 호출)
router.post('/subscribe', [
  body('planId').isInt({ min: 1 }),
  body('paymentId').optional().isInt({ min: 1 }),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const userId = req.user?.userId!;
    const { planId, paymentId } = req.body;

    // 기존 활성 구독이 있는지 확인
    const existingSubscription = await SubscriptionService.getUserSubscription(userId);
    if (existingSubscription && existingSubscription.status === 'active') {
      return res.status(400).json({ 
        error: 'You already have an active subscription',
        currentPlan: existingSubscription
      });
    }

    // 요금제 확인
    const plan = await SubscriptionService.getPlanById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    // 무료 플랜은 결제 없이 구독 가능
    if (plan.price === 0) {
      const subscription = await SubscriptionService.createSubscription(userId, planId);
      return res.status(201).json({
        success: true,
        subscription,
        message: 'Free subscription activated successfully'
      });
    }

    // 유료 플랜은 결제 ID 필수
    if (!paymentId) {
      return res.status(400).json({ 
        error: 'Payment required for paid subscription',
        plan: {
          name: plan.name,
          price: plan.price,
          currency: plan.currency
        }
      });
    }

    const subscription = await SubscriptionService.createSubscription(userId, planId, paymentId);
    
    res.status(201).json({
      success: true,
      subscription,
      message: 'Subscription created successfully'
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 구독 취소
router.post('/cancel', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId!;
    
    const cancelled = await SubscriptionService.cancelSubscription(userId);
    
    if (!cancelled) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    res.json({
      success: true,
      message: 'Subscription cancelled successfully. You can continue using premium features until the end of your billing period.'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 기능 사용 가능 여부 확인
router.get('/check/:feature', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId!;
    const featureName = req.params.feature;

    const result = await SubscriptionService.canUseFeature(userId, featureName);
    
    res.json({
      success: true,
      feature: featureName,
      ...result
    });
  } catch (error) {
    console.error('Check feature error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 기능 사용량 기록 (내부 API)
router.post('/usage/:feature', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId!;
    const featureName = req.params.feature;

    // 사용 가능한지 먼저 확인
    const canUse = await SubscriptionService.canUseFeature(userId, featureName);
    if (!canUse.allowed) {
      return res.status(403).json({
        error: 'Feature usage not allowed',
        reason: canUse.reason,
        feature: featureName
      });
    }

    // 사용량 증가
    await SubscriptionService.incrementFeatureUsage(userId, featureName);
    
    // 업데이트된 사용량 조회
    const updatedUsage = await SubscriptionService.getFeatureUsage(userId, featureName);
    
    res.json({
      success: true,
      message: 'Feature usage recorded',
      usage: updatedUsage
    });
  } catch (error) {
    console.error('Record usage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 구독 갱신 (자동 갱신용)
router.post('/renew', [
  body('paymentId').isInt({ min: 1 }),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const userId = req.user?.userId!;
    const { paymentId } = req.body;

    const currentSubscription = await SubscriptionService.getUserSubscription(userId);
    if (!currentSubscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // 새 구독 생성 (기존과 같은 플랜)
    const newSubscription = await SubscriptionService.createSubscription(
      userId, 
      currentSubscription.plan_id, 
      paymentId
    );

    res.json({
      success: true,
      subscription: newSubscription,
      message: 'Subscription renewed successfully'
    });
  } catch (error) {
    console.error('Renew subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;