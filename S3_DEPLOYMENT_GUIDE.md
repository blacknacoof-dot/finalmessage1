# 🚀 FinalMessage S3 프론트엔드 배포 가이드

## 📋 1단계: AWS CLI 설치

### Windows 설치 방법
1. **AWS CLI 다운로드**
   - https://aws.amazon.com/cli/ 방문
   - "AWS CLI for Windows" 다운로드
   - 또는 직접 링크: https://awscli.amazonaws.com/AWSCLIV2.msi

2. **설치 실행**
   ```bash
   # 다운로드 후 MSI 파일 실행
   # 기본 설정으로 설치 진행
   ```

3. **설치 확인**
   ```bash
   # 새 터미널/PowerShell 열고 확인
   aws --version
   # 출력 예: aws-cli/2.15.0 Python/3.11.6 Windows/10
   ```

### 대안: PowerShell로 설치
```powershell
# PowerShell 관리자 권한으로 실행
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi
```

## 🔑 2단계: AWS 자격 증명 설정

### AWS 계정 액세스 키 생성
1. **AWS 콘솔 로그인**
   - https://aws.amazon.com/console/ 접속

2. **IAM 사용자 생성** (권장)
   - IAM > 사용자 > 사용자 추가
   - 사용자 이름: `finalmessage-deploy`
   - 액세스 유형: 프로그래밍 방식 액세스

3. **권한 설정**
   - 기존 정책 직접 연결
   - 필요한 권한:
     - `AmazonS3FullAccess`
     - `CloudFrontFullAccess` (선택사항)

4. **액세스 키 다운로드**
   - Access Key ID와 Secret Access Key 안전하게 보관

### AWS CLI 구성
```bash
aws configure

# 입력 정보:
AWS Access Key ID [None]: YOUR_ACCESS_KEY_ID
AWS Secret Access Key [None]: YOUR_SECRET_ACCESS_KEY
Default region name [None]: ap-northeast-2
Default output format [None]: json
```

## 🏗️ 3단계: S3 버킷 생성 및 설정

### 고유한 버킷명 생성
```bash
# 현재 날짜와 시간으로 고유 버킷명 생성
BUCKET_NAME="finalmessage-frontend-$(date +%Y%m%d%H%M%S)"
echo "생성할 버킷명: $BUCKET_NAME"

# 또는 수동으로 설정 (전 세계에서 고유해야 함)
BUCKET_NAME="finalmessage-frontend-yourname-2025"
```

### S3 버킷 생성
```bash
# 서울 리전에 버킷 생성
aws s3 mb s3://$BUCKET_NAME --region ap-northeast-2

# 성공 메시지: make_bucket: finalmessage-frontend-xxxxx
```

### 웹사이트 호스팅 설정
```bash
# 정적 웹사이트 호스팅 활성화
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document index.html
```

### 퍼블릭 액세스 허용
```bash
# 퍼블릭 액세스 차단 해제
aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

### 버킷 정책 설정
```bash
# 버킷 정책 JSON 파일 생성
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

# 버킷 정책 적용
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json
```

## 📦 4단계: 프로덕션 빌드

### 빌드 실행
```bash
# 프로젝트 루트에서
cd C:\Users\black\finalmessage
npm run build

# 빌드 결과 확인
dir dist
# index.html, assets 폴더 등이 있어야 함
```

### 빌드 파일 확인
```bash
# 주요 파일들 확인
# - index.html (메인 페이지)
# - admin.html (관리자 페이지)  
# - login.html (로그인 페이지)
# - assets/ (CSS, JS 파일들)
```

## ☁️ 5단계: S3 배포

### 파일 업로드
```bash
# dist 폴더 내용을 S3에 동기화
aws s3 sync dist/ s3://$BUCKET_NAME --delete

# --delete: 로컬에서 삭제된 파일도 S3에서 제거
# 업로드 진행상황이 표시됨
```

### MIME 타입 설정
```bash
# HTML 파일
aws s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ \
  --recursive \
  --metadata-directive REPLACE \
  --content-type "text/html" \
  --exclude "*" --include "*.html"

# CSS 파일
aws s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ \
  --recursive \
  --metadata-directive REPLACE \
  --content-type "text/css" \
  --exclude "*" --include "*.css"

# JavaScript 파일
aws s3 cp s3://$BUCKET_NAME/ s3://$BUCKET_NAME/ \
  --recursive \
  --metadata-directive REPLACE \
  --content-type "application/javascript" \
  --exclude "*" --include "*.js"
```

## 🌐 6단계: 접속 확인

### S3 웹사이트 URL
```bash
# 웹사이트 엔드포인트 URL
echo "웹사이트 주소: http://$BUCKET_NAME.s3-website.ap-northeast-2.amazonaws.com"

# 브라우저에서 접속 테스트
curl -I http://$BUCKET_NAME.s3-website.ap-northeast-2.amazonaws.com
```

### 페이지별 접속 테스트
- **메인 페이지**: `http://버킷명.s3-website.ap-northeast-2.amazonaws.com/`
- **로그인 페이지**: `http://버킷명.s3-website.ap-northeast-2.amazonaws.com/login.html`
- **관리자 페이지**: `http://버킷명.s3-website.ap-northeast-2.amazonaws.com/admin.html`

## 🚀 7단계: 자동 배포 스크립트

### deploy.bat 생성 (Windows)
```batch
@echo off
echo 🚀 FinalMessage 프론트엔드 배포 시작...

REM 설정
set BUCKET_NAME=your-bucket-name-here

echo 📦 프로덕션 빌드 중...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ 빌드 실패!
    pause
    exit /b 1
)

echo ☁️ S3에 업로드 중...
aws s3 sync dist/ s3://%BUCKET_NAME% --delete
if %errorlevel% neq 0 (
    echo ❌ S3 업로드 실패!
    pause
    exit /b 1
)

echo ✅ 배포 완료!
echo 🌐 웹사이트 주소: http://%BUCKET_NAME%.s3-website.ap-northeast-2.amazonaws.com
pause
```

### package.json 스크립트 업데이트
```json
{
  "scripts": {
    "build": "vite build",
    "deploy:s3": "aws s3 sync dist/ s3://your-bucket-name --delete",
    "deploy": "npm run build && npm run deploy:s3"
  }
}
```

## 💰 비용 정보

### S3 호스팅 비용 (서울 리전)
- **스토리지**: $0.025/GB/월
- **요청**: GET $0.0004/1,000건  
- **데이터 전송**: 처음 1GB 무료

### 예상 월 비용
- **소규모 사이트** (< 1GB): $1-3/월
- **중간 규모** (1-5GB): $3-10/월

## 🔧 문제 해결

### 자주 발생하는 문제

#### 1. 403 Forbidden 오류
```bash
# 버킷 정책 확인
aws s3api get-bucket-policy --bucket $BUCKET_NAME

# 버킷 정책 재설정
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json
```

#### 2. 404 Not Found (React Router)
```bash
# 모든 경로를 index.html로 리다이렉트
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document index.html
```

#### 3. CORS 오류 (API 호출시)
```bash
# CORS 정책 설정
cat > cors-config.json << EOF
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
      "AllowedOrigins": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

aws s3api put-bucket-cors --bucket $BUCKET_NAME --cors-configuration file://cors-config.json
```

## 🎉 완료!

성공적으로 배포가 완료되면:

1. **웹사이트 주소**: `http://버킷명.s3-website.ap-northeast-2.amazonaws.com`
2. **로그인 페이지**: 위 주소 + `/login.html`
3. **관리자 페이지**: 위 주소 + `/admin.html`

### 다음 단계
- [ ] 도메인 연결 (Route 53)
- [ ] HTTPS 설정 (CloudFront)
- [ ] 백엔드 서버 배포 (EC2)
- [ ] 데이터베이스 연결 (RDS)

📞 **지원**: 문제가 발생하면 AWS 가이드문서나 AWS 지원팀에 문의하세요.