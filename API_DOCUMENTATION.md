# FinalMessage - 백엔드 API 및 데이터베이스 구조

## 현재 구조 분석

### 🏗️ 아키텍처 개요
```
Frontend (React) → Firebase Auth → Local Storage → Blockchain (Polygon)
                                ↓
                         Verification Service
```

## 📊 데이터베이스 설계 (필요한 구조)

### 1. 사용자 (Users) 테이블
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    plan VARCHAR(20) DEFAULT 'Free', -- Free, Premium, Pro
    wallet_address VARCHAR(42),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_activity TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
    email_verified BOOLEAN DEFAULT false
);
```

### 2. 메시지 (Messages) 테이블
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(200),
    content TEXT NOT NULL,
    message_hash VARCHAR(66) NOT NULL, -- Keccak256 hash
    blockchain_tx_hash VARCHAR(66),
    blockchain_block_number BIGINT,
    verification_level VARCHAR(20) DEFAULT 'basic', -- basic, enhanced
    digital_signature TEXT,
    timestamp_proof TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    encryption_key_hash VARCHAR(66),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'draft' -- draft, stored, verified, released
);
```

### 3. 검증자 (Verifiers) 테이블
```sql
CREATE TABLE verifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    relationship VARCHAR(50),
    is_primary BOOLEAN DEFAULT false,
    notification_preferences JSONB DEFAULT '{"email": true, "sms": false}',
    created_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' -- active, inactive, removed
);
```

### 4. 검증 프로세스 (Verification Processes) 테이블
```sql
CREATE TABLE verification_processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    message_id UUID REFERENCES messages(id),
    trigger_reason VARCHAR(50) NOT NULL, -- inactivity, manual, scheduled
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, failed, cancelled
    total_verifiers INTEGER NOT NULL,
    completed_verifications INTEGER DEFAULT 0,
    metadata JSONB
);
```

### 5. 검증 기록 (Verifications) 테이블
```sql
CREATE TABLE verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id UUID REFERENCES verification_processes(id),
    verifier_id UUID REFERENCES verifiers(id),
    verification_code VARCHAR(32),
    verified_at TIMESTAMP,
    verification_method VARCHAR(20), -- email, sms, in_person
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, expired
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 6. 블록체인 트랜잭션 (Blockchain Transactions) 테이블
```sql
CREATE TABLE blockchain_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    message_id UUID REFERENCES messages(id),
    transaction_hash VARCHAR(66) NOT NULL,
    block_number BIGINT,
    block_hash VARCHAR(66),
    gas_used BIGINT,
    gas_price BIGINT,
    network VARCHAR(20) DEFAULT 'polygon-amoy',
    contract_address VARCHAR(42),
    transaction_type VARCHAR(30), -- store_hash, update_activity, verify_message
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, failed
    created_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP
);
```

### 7. 시스템 설정 (System Settings) 테이블
```sql
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    data_type VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
    is_public BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 8. 활동 로그 (Activity Logs) 테이블
```sql
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔌 필요한 API 엔드포인트

### 인증 API
```typescript
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
GET  /api/auth/profile
PUT  /api/auth/profile
```

### 사용자 관리 API
```typescript
GET    /api/users                    // Admin: 모든 사용자 조회
GET    /api/users/:id               // 특정 사용자 조회
PUT    /api/users/:id               // 사용자 정보 수정
DELETE /api/users/:id               // 사용자 삭제
PUT    /api/users/:id/status        // 사용자 상태 변경 (정지/활성화)
```

### 메시지 API
```typescript
GET    /api/messages                // 내 메시지 목록
POST   /api/messages                // 새 메시지 작성
GET    /api/messages/:id            // 특정 메시지 조회
PUT    /api/messages/:id            // 메시지 수정
DELETE /api/messages/:id            // 메시지 삭제
POST   /api/messages/:id/store      // 블록체인에 메시지 저장
POST   /api/messages/:id/verify     // 메시지 무결성 검증
```

### 검증자 API
```typescript
GET    /api/verifiers               // 내 검증자 목록
POST   /api/verifiers               // 검증자 추가
PUT    /api/verifiers/:id           // 검증자 정보 수정
DELETE /api/verifiers/:id           // 검증자 삭제
POST   /api/verifiers/:id/notify    // 검증자에게 알림 발송
```

### 검증 프로세스 API
```typescript
GET    /api/verification-processes              // Admin: 모든 검증 프로세스
POST   /api/verification-processes              // 검증 프로세스 시작
GET    /api/verification-processes/:id          // 특정 프로세스 조회
PUT    /api/verification-processes/:id/complete // 강제 완료
POST   /api/verify/:code                        // 검증 코드로 검증 완료
```

### 블록체인 API
```typescript
GET    /api/blockchain/transactions       // Admin: 모든 트랜잭션
POST   /api/blockchain/store-hash         // 메시지 해시 저장
GET    /api/blockchain/transaction/:hash  // 트랜잭션 상태 확인
POST   /api/blockchain/verify-hash        // 해시 검증
```

### Admin API
```typescript
GET    /api/admin/dashboard/stats     // 대시보드 통계
GET    /api/admin/users               // 사용자 관리
GET    /api/admin/verifications       // 검증 상태 관리
GET    /api/admin/blockchain          // 블록체인 모니터링
GET    /api/admin/settings            // 시스템 설정
PUT    /api/admin/settings/:key       // 설정 변경
```

## 🔐 현재 사용 중인 서비스

### 1. Firebase 인증
```typescript
// services/authService.ts
- 이메일/비밀번호 인증
- Google OAuth
- 카카오, 네이버 소셜 로그인 (준비됨)
```

### 2. 블록체인 서비스 (Polygon)
```typescript
// services/blockchainService.ts
- Polygon Amoy 테스트넷 사용
- MetaMask 지갑 연결
- 스마트 컨트랙트 상호작용
- 메시지 해시 저장/검증
```

### 3. 검증 서비스
```typescript
// services/verificationService.ts
- 메시지 무결성 검증
- 사용자 활동 추적
- 검증자 알림 시스템
- 검증 프로세스 관리
```

### 4. 로컬 스토리지 기반 데이터
```typescript
// 현재 LocalStorage에 저장되는 데이터:
- 사용자 정보
- 메시지 목록
- 검증자 정보
- 검증 프로세스 상태
```

## 🚀 권장 백엔드 스택

### 1. Node.js + Express + TypeScript
```typescript
// 빠른 개발과 TypeScript 호환성
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/verifiers', verifierRoutes);
app.use('/api/admin', adminRoutes);
```

### 2. 데이터베이스: PostgreSQL
```sql
-- 복잡한 관계형 데이터 처리
-- JSON/JSONB 지원으로 유연성
-- 트랜잭션 지원
```

### 3. 인증: JWT + Firebase Admin SDK
```typescript
// Firebase 토큰 검증
// JWT 기반 세션 관리
// 역할 기반 접근 제어 (RBAC)
```

### 4. 캐싱: Redis
```typescript
// 세션 데이터
// 검증 코드 임시 저장
// API 응답 캐싱
```

## 📈 구현 우선순위

### Phase 1: 기본 백엔드
1. ✅ 사용자 인증 API
2. ✅ 메시지 CRUD API  
3. ✅ 검증자 관리 API

### Phase 2: 검증 시스템
1. 🔄 검증 프로세스 API
2. 📧 이메일/SMS 알림
3. 🔗 블록체인 연동

### Phase 3: 관리자 기능
1. 📊 Admin 대시보드 API
2. 📈 통계 및 모니터링
3. ⚙️ 시스템 설정

## 🔧 환경 변수

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/finalmessage

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Blockchain
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology/
CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
PRIVATE_KEY=your-private-key

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h

# Email/SMS
SENDGRID_API_KEY=your-sendgrid-key
TWILIO_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token

# Redis
REDIS_URL=redis://localhost:6379
```

이 구조로 백엔드를 구축하면 현재 프론트엔드와 완벽하게 연동됩니다!