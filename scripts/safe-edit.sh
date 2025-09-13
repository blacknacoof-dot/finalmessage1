#!/bin/bash

# 🛡️ 안전한 파일 편집 스크립트
# 사용법: ./scripts/safe-edit.sh <파일경로> [편집기]

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROTECTED_FILES=("$PROJECT_ROOT/index.css" "$PROJECT_ROOT/tailwind.config.js" "$PROJECT_ROOT/postcss.config.js" "$PROJECT_ROOT/vite.config.ts")
CRITICAL_DIRS=("$PROJECT_ROOT/views" "$PROJECT_ROOT/components" "$PROJECT_ROOT/services")

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

FILE_PATH="$1"
EDITOR="${2:-nano}"

if [ -z "$FILE_PATH" ]; then
    echo -e "${RED}❌ 파일 경로를 지정해주세요!${NC}"
    echo "사용법: ./scripts/safe-edit.sh <파일경로> [편집기]"
    exit 1
fi

# 절대 경로 변환
if [[ "$FILE_PATH" != /* ]]; then
    FILE_PATH="$PROJECT_ROOT/$FILE_PATH"
fi

echo -e "${BLUE}🛡️ 안전한 파일 편집 시작...${NC}"
echo -e "대상 파일: ${FILE_PATH}"

# 파일 존재 확인
if [ ! -f "$FILE_PATH" ]; then
    echo -e "${RED}❌ 파일이 존재하지 않습니다!${NC}"
    exit 1
fi

# 보호된 파일 확인
IS_PROTECTED=false
for protected in "${PROTECTED_FILES[@]}"; do
    if [ "$FILE_PATH" -ef "$protected" ]; then
        IS_PROTECTED=true
        break
    fi
done

# 중요 디렉토리 확인
IS_CRITICAL=false
for critical in "${CRITICAL_DIRS[@]}"; do
    if [[ "$FILE_PATH" == "$critical"* ]]; then
        IS_CRITICAL=true
        break
    fi
done

# 경고 표시
if [ "$IS_PROTECTED" = true ]; then
    echo -e "${RED}⚠️  경고: 이 파일은 디자인/스타일에 영향을 주는 중요 파일입니다!${NC}"
    echo -e "${YELLOW}   - 수정 전 반드시 백업이 생성됩니다${NC}"
    echo -e "${YELLOW}   - 문제 발생 시 즉시 복원이 가능합니다${NC}"
elif [ "$IS_CRITICAL" = true ]; then
    echo -e "${YELLOW}⚠️  주의: 이 파일은 시스템 핵심 파일입니다!${NC}"
    echo -e "${YELLOW}   - 수정 전 백업이 생성됩니다${NC}"
fi

# 편집 전 백업 생성
echo -e "${YELLOW}📦 편집 전 백업 생성 중...${NC}"
./scripts/backup.sh pre-change

# 파일 수정 시간 저장
ORIGINAL_MTIME=$(stat -f %m "$FILE_PATH" 2>/dev/null || stat -c %Y "$FILE_PATH")

echo -e "${GREEN}✅ 백업 완료! 안전하게 편집할 수 있습니다.${NC}"
echo -e "${BLUE}편집기 시작: $EDITOR${NC}"

# 편집기 실행
$EDITOR "$FILE_PATH"

# 파일이 변경되었는지 확인
NEW_MTIME=$(stat -f %m "$FILE_PATH" 2>/dev/null || stat -c %Y "$FILE_PATH")

if [ "$ORIGINAL_MTIME" != "$NEW_MTIME" ]; then
    echo -e "${YELLOW}📝 파일이 수정되었습니다.${NC}"
    
    # 보호된 파일인 경우 빌드 테스트
    if [ "$IS_PROTECTED" = true ] || [ "$IS_CRITICAL" = true ]; then
        echo -e "${YELLOW}🔍 변경사항 검증 중...${NC}"
        
        cd "$PROJECT_ROOT"
        if npm run build > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 빌드 성공! 변경사항이 안전합니다.${NC}"
        else
            echo -e "${RED}❌ 빌드 실패! 변경사항에 문제가 있습니다.${NC}"
            echo -e "${YELLOW}복원하시겠습니까? (Y/n): ${NC}"
            read -r RESTORE
            
            if [[ ! "$RESTORE" =~ ^[Nn]$ ]]; then
                echo -e "${YELLOW}🔄 복원 중...${NC}"
                # 최신 pre-change 백업으로 복원
                LATEST_BACKUP=$(ls -1t .project-backups/pre-change-*.tar.gz | head -1)
                if [ -f "$LATEST_BACKUP" ]; then
                    ./scripts/restore.sh "$(basename "$LATEST_BACKUP")"
                    echo -e "${GREEN}✅ 복원 완료!${NC}"
                fi
            fi
        fi
    fi
else
    echo -e "${BLUE}파일이 변경되지 않았습니다.${NC}"
fi

echo -e "${BLUE}🎉 안전한 편집 완료!${NC}"