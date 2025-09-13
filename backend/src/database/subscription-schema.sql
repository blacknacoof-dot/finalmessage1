-- 구독 및 요금제 관련 테이블

-- 요금제 테이블
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KRW',
    duration_days INTEGER NOT NULL, -- 30일 = 월간, 365일 = 연간
    features JSONB, -- 사용 가능한 기능들
    max_messages INTEGER, -- 최대 메시지 수
    legal_notary BOOLEAN DEFAULT false, -- 법적 공증 기능
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 구독 테이블
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES subscription_plans(id),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'expired', 'cancelled'
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    payment_id INTEGER REFERENCES payments(id),
    auto_renew BOOLEAN DEFAULT true,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 기능 사용량 추적 테이블
CREATE TABLE IF NOT EXISTS feature_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL, -- 'message_send', 'legal_notary', 'blockchain_verify'
    usage_count INTEGER DEFAULT 0,
    reset_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 월간 리셋 날짜
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 기본 요금제 데이터 삽입
INSERT INTO subscription_plans (name, description, price, duration_days, features, max_messages, legal_notary) VALUES 
('Free', '기본 무료 플랜', 0.00, 30, '{"basic_message": true, "email_delivery": true}', 3, false),
('Premium', '프리미엄 월간 플랜', 15000.00, 30, '{"basic_message": true, "email_delivery": true, "legal_notary": true, "priority_support": true, "blockchain_verify": true}', 50, true),
('Pro', '프로 연간 플랜', 150000.00, 365, '{"basic_message": true, "email_delivery": true, "legal_notary": true, "priority_support": true, "blockchain_verify": true, "bulk_message": true}', 500, true)
ON CONFLICT DO NOTHING;

-- 기본 시스템 설정 추가
INSERT INTO settings (key, value, description) VALUES
('subscription_enabled', 'true', '구독 시스템 활성화'),
('free_plan_message_limit', '3', '무료 플랜 메시지 제한'),
('premium_plan_message_limit', '50', '프리미엄 플랜 메시지 제한'),
('legal_notary_fee', '5000', '법적 공증 추가 수수료 (KRW)'),
('trial_period_days', '7', '무료 체험 기간 (일)')
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = CURRENT_TIMESTAMP;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_id ON feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_feature_name ON feature_usage(feature_name);

-- 트리거 적용
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_usage_updated_at BEFORE UPDATE ON feature_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();