# FinalMessage AWS 배포 가이드

## 🎯 배포 아키텍처

### 프론트엔드
- **S3 + CloudFront**: React 정적 웹사이트 호스팅
- **도메인**: Route 53 DNS 관리
- **SSL**: CloudFront 자동 SSL

### 백엔드
- **EC2**: Node.js 서버 호스팅
- **RDS PostgreSQL**: 관리형 데이터베이스
- **ALB**: Application Load Balancer

## 🚀 배포 단계

### 1단계: AWS 계정 설정
```bash
# AWS CLI 설치 및 설정
aws configure
# Access Key, Secret Key, Region 입력
```

### 2단계: 프론트엔드 배포 (S3 + CloudFront)
```bash
# 빌드
npm run build

# S3 버킷 생성
aws s3 mb s3://finalmessage-frontend

# 정적 웹사이트 호스팅 설정
aws s3 website s3://finalmessage-frontend \
  --index-document index.html \
  --error-document index.html

# 파일 업로드
aws s3 sync dist/ s3://finalmessage-frontend --delete

# CloudFront 배포 생성 (콘솔에서)
```

### 3단계: 백엔드 배포 (EC2)
```bash
# EC2 인스턴스 생성 (Ubuntu 22.04 LTS)
# t3.micro (프리티어) 또는 t3.small

# 서버 접속 후
sudo apt update
sudo apt install -y nodejs npm nginx

# 프로젝트 클론
git clone <repository-url>
cd finalmessage/backend

# 의존성 설치
npm install

# PM2 설치 (프로세스 매니저)
sudo npm install -g pm2

# 환경변수 설정
cp .env.example .env.production
# 프로덕션 설정 입력

# 애플리케이션 시작
pm2 start dist/index.js --name "finalmessage-backend"
pm2 startup
pm2 save
```

### 4단계: 데이터베이스 설정 (RDS)
```bash
# RDS PostgreSQL 인스턴스 생성
# 보안 그룹에서 EC2에서만 접근 허용 (포트 5432)

# 데이터베이스 스키마 생성
psql -h <rds-endpoint> -U <username> -d <database>
\i schema.sql
```

### 5단계: Nginx 리버스 프록시 설정
```nginx
# /etc/nginx/sites-available/finalmessage
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 환경변수 설정

### 프로덕션 .env
```env
NODE_ENV=production
PORT=3002

# RDS 데이터베이스
DB_HOST=<rds-endpoint>
DB_PORT=5432
DB_NAME=finalmessage
DB_USER=<db-username>
DB_PASSWORD=<db-password>

# JWT 설정
JWT_SECRET=<strong-secret-key>
JWT_EXPIRES_IN=7d

# 이메일 설정 (AWS SES)
EMAIL_SERVICE=ses
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret-key>

# CORS 설정
CORS_ORIGIN=https://yourdomain.com

# 블록체인 설정
POLYGON_RPC_URL=<polygon-mainnet-url>
PRIVATE_KEY=<blockchain-private-key>
```

## 📊 모니터링 설정

### CloudWatch 로그
```bash
# CloudWatch 에이전트 설치
sudo apt install -y awscli

# 로그 그룹 생성
aws logs create-log-group --log-group-name finalmessage-backend

# PM2 로그를 CloudWatch로 전송
pm2 install pm2-cloudwatch
```

### 헬스 체크
```bash
# ALB 헬스 체크 엔드포인트
GET /health
```

## 💰 비용 최적화

### 프리티어 활용
- EC2 t3.micro (12개월 무료)
- RDS t3.micro (12개월 무료)
- S3 5GB (영구 무료)
- CloudFront 50GB (영구 무료)

### 예상 월 비용 (프리티어 이후)
- EC2 t3.small: $15/월
- RDS t3.small: $20/월
- S3 + CloudFront: $5/월
- 데이터 전송: $10/월
- **총합: 약 $50/월**

## 🔒 보안 설정

### EC2 보안 그룹
- SSH (22): 본인 IP만
- HTTP (80): 전체 허용
- HTTPS (443): 전체 허용
- Custom (3002): ALB에서만

### RDS 보안 그룹
- PostgreSQL (5432): EC2 보안 그룹에서만

### IAM 역할
- EC2 → RDS, SES 접근 권한
- 최소 권한 원칙 적용

## 🚀 배포 자동화

### GitHub Actions (선택사항)
```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS
on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and Deploy
        run: |
          npm install
          npm run build
          aws s3 sync dist/ s3://finalmessage-frontend

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to EC2
        run: |
          ssh ec2-user@$EC2_HOST "cd /app && git pull && npm install && pm2 reload all"
```

## 📞 도메인 설정

### Route 53
1. 도메인 구매 또는 기존 도메인 이전
2. A 레코드: www → CloudFront
3. CNAME 레코드: api → ALB

### SSL 인증서
- CloudFront: AWS Certificate Manager 자동
- ALB: AWS Certificate Manager 자동

## 🔄 백업 & 복구

### RDS 자동 백업
- 백업 보존 기간: 7일
- 스냅샷 자동 생성

### 코드 백업
- GitHub 저장소
- S3 버킷 버전 관리

이 가이드를 따라하면 안정적이고 확장 가능한 AWS 배포를 완성할 수 있습니다!