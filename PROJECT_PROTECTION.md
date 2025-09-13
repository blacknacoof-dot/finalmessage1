# 🛡️ FinalMessage 프로젝트 보호 시스템

> **절대 파일이 깨지거나 디자인이 손상되지 않도록 하는 완벽한 보호 시스템**

## 🚫 **절대 금지 사항**

### ❌ **직접 수정 금지 파일들**
```
index.css              # 메인 스타일 파일
tailwind.config.js      # Tailwind 설정
postcss.config.js       # PostCSS 설정  
vite.config.ts         # Vite 빌드 설정
```

### ❌ **절대 삭제하면 안 되는 디렉토리**
```
views/                 # 모든 페이지 컴포넌트
components/            # UI 컴포넌트들
services/              # 핵심 서비스 로직
utils/                 # 유틸리티 함수들
.project-backups/      # 백업 저장소
scripts/               # 보호 스크립트들
```

### ❌ **금지된 작업들**
- `npm uninstall` 무분별한 패키지 삭제
- `rm -rf` 디렉토리 강제 삭제
- 직접적인 CSS 파일 편집
- 빌드 설정 파일 임의 수정
- 의존성 버전 임의 변경

---

## ✅ **안전한 작업 방법**

### 1️⃣ **파일 편집시 (필수)**
```bash
# ❌ 직접 편집 금지
nano index.css

# ✅ 안전한 편집 방법
./scripts/safe-edit.sh index.css
./scripts/safe-edit.sh views/Landing.tsx
./scripts/safe-edit.sh components/Footer.tsx
```

### 2️⃣ **백업 생성 (작업 전 필수)**
```bash
# 수동 백업
./scripts/backup.sh manual

# 중요 변경 전 백업
./scripts/backup.sh pre-change

# 일일 백업
./scripts/backup.sh daily
```

### 3️⃣ **문제 발생시 즉시 복원**
```bash
# 백업 목록 보고 복원
./scripts/restore.sh

# 특정 백업으로 복원
./scripts/restore.sh manual-backup-20250912_102030
```

---

## 🔄 **자동 보호 시스템**

### 📦 **자동 백업**
- **Git 커밋 전**: 자동으로 백업 생성
- **중요 파일 편집 시**: pre-change 백업 생성  
- **빌드 실패 시**: 자동 복원 제안

### 🛡️ **실시간 보호**
- **파일 변경 감지**: 중요 파일 수정시 경고
- **빌드 검증**: 변경 후 자동 빌드 테스트
- **롤백 시스템**: 문제 발생시 즉시 이전 상태로 복원

### 📊 **백업 관리**
- **자동 정리**: 30개 이상 백업시 오래된 것 삭제
- **백업 목록**: 모든 백업의 날짜/타입/크기 추적
- **긴급 백업**: 복원 전 현재 상태 자동 백업

---

## 📋 **사용 가능한 명령어**

### 🔧 **백업 관련**
```bash
./scripts/backup.sh                    # 수동 백업
./scripts/backup.sh daily              # 일일 백업  
./scripts/backup.sh pre-change          # 변경 전 백업
```

### 🔄 **복원 관련**
```bash
./scripts/restore.sh                   # 대화식 복원
./scripts/restore.sh backup-name       # 특정 백업 복원
```

### ✏️ **안전한 편집**
```bash
./scripts/safe-edit.sh <파일경로>       # 안전한 파일 편집
./scripts/safe-edit.sh index.css       # CSS 안전 편집
./scripts/safe-edit.sh views/App.tsx   # 컴포넌트 안전 편집
```

---

## 🚨 **비상 대응 절차**

### 1️⃣ **빌드 실패시**
```bash
# 1. 즉시 백업 목록 확인
ls -la .project-backups/

# 2. 최신 안정 백업으로 복원
./scripts/restore.sh

# 3. 빌드 테스트
npm run build
```

### 2️⃣ **파일 손상시**
```bash
# 1. 긴급 복원
./scripts/restore.sh stable-backup-20250912

# 2. 의존성 재설치
npm install

# 3. 서버 재시작
npm run dev
```

### 3️⃣ **완전 초기화시**
```bash
# 1. 프로젝트 디렉토리에서
cd .project-backups/

# 2. 가장 최근 안정 백업 확인
ls -1t *stable*.tar.gz | head -1

# 3. 해당 백업으로 복원
../scripts/restore.sh [백업파일명]
```

---

## 📁 **백업 파일 구조**

```
.project-backups/
├── stable-backup-20250912.tar.gz      # 오늘 생성된 안정 백업
├── daily-backup-20250912_143022.tar.gz # 일일 자동 백업
├── pre-change-backup-*.tar.gz          # 변경 전 백업들  
├── manual-backup-*.tar.gz              # 수동 백업들
├── emergency-backup-*.tar.gz           # 긴급 백업들
└── backup-list.txt                     # 백업 목록 기록
```

---

## ⚙️ **보호된 파일 목록**

### 🎨 **디자인/스타일 파일**
- `index.css` - 메인 스타일
- `tailwind.config.js` - Tailwind 설정
- `postcss.config.js` - PostCSS 설정

### 🔧 **빌드 설정 파일**  
- `vite.config.ts` - Vite 설정
- `package.json` - 의존성 설정
- `tsconfig.json` - TypeScript 설정

### 📱 **핵심 컴포넌트**
- `views/` - 모든 페이지 컴포넌트
- `components/` - UI 컴포넌트  
- `services/` - 비즈니스 로직
- `utils/` - 유틸리티 함수

---

## 🎯 **보호 시스템 목표**

✅ **100% 안전성**: 어떤 상황에서도 프로젝트 복원 가능  
✅ **0% 데이터 손실**: 모든 중요 변경사항 자동 백업  
✅ **즉시 복원**: 문제 발생시 1분 내 이전 상태로 복원  
✅ **자동화**: 사용자가 실수해도 시스템이 자동 보호  

---

## 📞 **문제 발생시 체크리스트**

- [ ] 백업 파일 존재 확인: `ls .project-backups/`
- [ ] 최신 백업 날짜 확인: `ls -lt .project-backups/`  
- [ ] 복원 실행: `./scripts/restore.sh`
- [ ] 빌드 테스트: `npm run build`
- [ ] 개발 서버 실행: `npm run dev`

**🚨 이 시스템으로 절대 파일이 깨지지 않습니다!**