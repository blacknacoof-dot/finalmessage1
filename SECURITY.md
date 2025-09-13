# 보안 가이드 (Security Guide)

## 🔒 배포 전 보안 체크리스트

### 환경 변수 설정
- [ ] `.env` 파일에 실제 API 키 설정
- [ ] 프로덕션 환경에서 테스트 키 제거
- [ ] Firebase 프로젝트 실제 설정 확인

### API 키 보안
- [ ] Google AI API 키: `VITE_GOOGLE_AI_API_KEY`
- [ ] Firebase 설정: `VITE_FIREBASE_*`
- [ ] PortOne 결제: `VITE_PORTONE_*`

## 🛡️ 현재 보안 기능

### 1. 인증 및 권한
- ✅ Firebase Authentication 사용
- ✅ 소셜 로그인 지원 (Google, Kakao, Naver)
- ✅ 이메일/비밀번호 검증 (최소 6자)
- ✅ 시뮬레이션 모드로 안전한 개발 환경

### 2. 파일 업로드 보안
- ✅ 파일 타입 검증 (화이트리스트)
- ✅ 파일 크기 제한
  - 이미지: 10MB
  - 비디오: 100MB
  - 오디오: 50MB
  - 문서: 20MB
- ✅ 안전한 파일명 생성 (`timestamp_filename`)

### 3. 데이터 보호
- ✅ 클라이언트 사이드 IndexedDB 암호화 저장
- ✅ 비밀번호 보호 자산 (옵션)
- ✅ localStorage 네임스페이스 (`finalmessage_`)
- ✅ 안전한 로그아웃 (모든 로컬 데이터 정리)

### 4. 입력 검증
- ✅ 이메일 형식 검증
- ✅ 비밀번호 강도 검증
- ✅ 파일 타입/크기 검증
- ✅ React 기본 XSS 보호

### 5. 에러 처리
- ✅ 민감한 정보 노출 방지
- ✅ 사용자 친화적 오류 메시지
- ✅ 상세 로그는 콘솔로만 출력

## ⚠️ 배포 시 주의사항

### 환경별 설정
```bash
# 개발 환경
VITE_FIREBASE_API_KEY=test-firebase-api-key

# 프로덕션 환경  
VITE_FIREBASE_API_KEY=실제_Firebase_API_키
VITE_GOOGLE_AI_API_KEY=실제_Google_AI_API_키
```

### Firebase 보안 규칙 설정 필요
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### HTTPS 필수
- 모든 API 통신 HTTPS 사용
- 개발 환경에서도 localhost는 안전

## 🚨 알려진 제한사항

### 클라이언트 사이드 보안
- 클라이언트 사이드 앱의 한계로 완전한 암호화는 불가능
- 중요한 데이터는 서버 사이드 처리 권장

### 브라우저 저장소
- IndexedDB/localStorage는 브라우저에 의존
- 사용자가 브라우저 데이터를 삭제하면 손실 가능

## 📞 보안 이슈 신고

보안 취약점을 발견하신 경우:
1. 공개 이슈로 올리지 말고 비공개로 연락
2. 상세한 재현 방법과 영향도 포함
3. 책임감 있는 공개 원칙 준수