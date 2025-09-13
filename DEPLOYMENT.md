# 🚀 배포 가이드 (Deployment Guide)

## 📋 배포 전 최종 체크리스트

### ✅ 보안 검증 완료
- [x] API 키 환경변수 처리 완료
- [x] 파일 업로드 보안 검증 (크기/타입 제한)
- [x] 데이터 암호화 및 저장 보안 확인
- [x] 인증 시스템 보안 검증
- [x] XSS/인젝션 취약점 점검 완료
- [x] .gitignore 보안 파일 추가

### ✅ 코드 품질 검증
- [x] TypeScript 타입 오류 해결 (7개 FIX 주석 정리)
- [x] 과도한 alert() 사용 개선 (50개 → Toast/Modal 교체)
- [x] 오류 처리 강화 (Firebase, 블록체인, 파일 저장)
- [x] 사용자 경험 개선 (결제, 파일 업로드, 권한)
- [x] 최종 빌드 성공 확인

## 🌐 배포 옵션

### 1. Vercel (권장)
```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 로그인
vercel login

# 3. 환경변수 설정
vercel env add VITE_GOOGLE_AI_API_KEY
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_PROJECT_ID
# ... 기타 필요한 환경변수

# 4. 배포
vercel --prod
```

### 2. Netlify
```bash
# 1. 빌드
npm run build

# 2. Netlify CLI 배포
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### 3. Firebase Hosting
```bash
# 1. Firebase CLI 설치
npm i -g firebase-tools

# 2. 초기화
firebase init hosting

# 3. 배포
firebase deploy
```

## ⚙️ 환경변수 설정

### 필수 환경변수
```env
# Google AI (Gemini)
VITE_GOOGLE_AI_API_KEY=your_actual_google_ai_api_key

# Firebase
VITE_FIREBASE_API_KEY=your_actual_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com  
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# PortOne 결제 (선택사항)
VITE_PORTONE_IMP_CODE=your_portone_imp_code
VITE_PORTONE_API_KEY=your_portone_api_key
```

### 개발/프로덕션 구분
- 개발: `VITE_FIREBASE_API_KEY=test-firebase-api-key`
- 프로덕션: 실제 Firebase 프로젝트 키

## 🔧 빌드 최적화

### 현재 번들 크기
```
index.html: 2.00 kB
index-DSxUImqk.js: 122.27 kB (gzip: 48.17 kB)
index-DgKMT3DQ.js: 1,088.23 kB (gzip: 289.88 kB)
```

### 성능 개선 권장사항
```javascript
// vite.config.ts에 추가
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/storage'],
          blockchain: ['ethers', 'web3']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

## 🚦 배포 후 확인사항

### 1. 기능 테스트
- [ ] 사용자 로그인/회원가입
- [ ] 파일 업로드/다운로드
- [ ] 결제 시스템 (테스트/실제)
- [ ] 블록체인 연결
- [ ] 알림 시스템 (Toast/Modal)

### 2. 보안 확인
- [ ] HTTPS 연결 확인
- [ ] API 키 노출 여부 검사
- [ ] 개발자 도구에서 민감 정보 확인
- [ ] CSP(Content Security Policy) 설정

### 3. 성능 모니터링
- [ ] 초기 로딩 시간
- [ ] 파일 업로드 성능
- [ ] 모바일 반응성

## 🐞 일반적인 배포 이슈

### 1. 환경변수 문제
```bash
# 확인 방법
console.log(import.meta.env.VITE_FIREBASE_API_KEY)

# 해결: 배포 플랫폼에서 환경변수 올바르게 설정
```

### 2. 라우팅 문제 (SPA)
```
# _redirects 파일 생성 (Netlify)
/*    /index.html   200

# vercel.json 설정 (Vercel)  
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 3. Firebase 설정 문제
- Firebase 콘솔에서 도메인 승인 필요
- 인증 제공업체 설정 확인

## 🎯 배포 완료 후

### 도메인 설정
1. 사용자 정의 도메인 연결
2. SSL 인증서 자동 설정 확인
3. DNS 설정 완료

### 모니터링 설정
- Google Analytics 추가
- 에러 추적 (Sentry 등)
- 성능 모니터링

## 📞 지원 및 문제 해결

배포 관련 문제 발생 시:
1. 빌드 로그 확인
2. 브라우저 개발자 도구 콘솔 확인  
3. 환경변수 설정 재확인
4. 캐시 클리어 후 재시도

---

**배포 준비 완료!** 위 가이드를 따라 안전하고 성공적인 배포를 진행하세요. 🚀