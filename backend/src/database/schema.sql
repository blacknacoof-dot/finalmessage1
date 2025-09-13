-- Final Message 데이터베이스 스키마

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    provider VARCHAR(50) DEFAULT 'email', -- 'email', 'google', 'kakao', 'naver'
    provider_id VARCHAR(255),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    email_verification_code VARCHAR(6),
    email_verification_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 메시지 테이블
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    recipient_emails TEXT[], -- 수신자 이메일 배열
    delivery_date TIMESTAMP NOT NULL,
    is_delivered BOOLEAN DEFAULT false,
    delivery_method VARCHAR(50) DEFAULT 'email', -- 'email', 'sms', 'both'
    blockchain_hash VARCHAR(255), -- 블록체인 해시
    verification_hash VARCHAR(255), -- SHA-256 해시
    requires_legal_notary BOOLEAN DEFAULT false, -- 법적 공증 요구 여부
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 검증 테이블
CREATE TABLE IF NOT EXISTS verifications (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
    sha256_hash VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    blockchain_tx_hash VARCHAR(255),
    block_number BIGINT,
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 블록체인 트랜잭션 테이블
CREATE TABLE IF NOT EXISTS blockchain_transactions (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
    tx_hash VARCHAR(255) UNIQUE NOT NULL,
    block_number BIGINT,
    gas_used BIGINT,
    gas_price BIGINT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
    network VARCHAR(50) DEFAULT 'polygon-amoy',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP
);

-- 결제 테이블
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message_id INTEGER REFERENCES messages(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KRW',
    payment_method VARCHAR(50), -- 'card', 'bank', 'kakao_pay', etc.
    payment_id VARCHAR(255) UNIQUE, -- PortOne payment ID
    merchant_uid VARCHAR(255) UNIQUE,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'cancelled'
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 관리자 테이블
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin', -- 'super_admin', 'admin', 'moderator'
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 파트너 테이블
CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 시스템 설정 테이블
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_delivery_date ON messages(delivery_date);
CREATE INDEX IF NOT EXISTS idx_verifications_message_id ON verifications(message_id);
CREATE INDEX IF NOT EXISTS idx_verifications_sha256_hash ON verifications(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_message_id ON blockchain_transactions(message_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_tx_hash ON blockchain_transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);

-- 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 기본 관리자 계정 생성 (비밀번호: admin123)
INSERT INTO admins (email, name, password_hash, role) 
VALUES ('admin@finalmessage.com', 'Administrator', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeQEQOTDbY7QqYaAK', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- 기본 시스템 설정
INSERT INTO settings (key, value, description) VALUES
('site_name', 'Final Message', '사이트 이름'),
('maintenance_mode', 'false', '유지보수 모드'),
('max_message_size', '10000', '최대 메시지 크기 (문자)'),
('min_delivery_days', '1', '최소 배송 일수'),
('max_delivery_days', '365', '최대 배송 일수')
ON CONFLICT (key) DO NOTHING;