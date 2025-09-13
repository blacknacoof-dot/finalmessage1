#!/bin/bash

# 🔄 Git 커밋 전 자동 백업 훅
# 이 스크립트는 git commit 전에 자동으로 실행됩니다

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 색상 코드
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 커밋 전 자동 백업 실행...${NC}"

# 중요 파일이 변경되었는지 확인
CRITICAL_FILES_CHANGED=$(git diff --cached --name-only | grep -E "\.(css|tsx|ts|js|json|html)$" | wc -l)

if [ "$CRITICAL_FILES_CHANGED" -gt 0 ]; then
    echo -e "${YELLOW}📦 중요 파일 변경 감지 - 백업 생성 중...${NC}"
    
    cd "$PROJECT_ROOT"
    ./scripts/backup.sh daily
    
    echo -e "${GREEN}✅ 자동 백업 완료!${NC}"
else
    echo -e "${BLUE}ℹ️  중요 파일 변경 없음 - 백업 생략${NC}"
fi

echo -e "${GREEN}✅ 커밋 전 검사 완료!${NC}"