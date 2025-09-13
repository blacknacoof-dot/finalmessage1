#!/bin/bash

# 🔄 FinalMessage 프로젝트 복원 스크립트
# 사용법: ./scripts/restore.sh [backup-filename]

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/.project-backups"
BACKUP_LIST="$BACKUP_DIR/backup-list.txt"

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 FinalMessage 프로젝트 복원 시작...${NC}"

# 백업 목록 확인
if [ ! -d "$BACKUP_DIR" ] || [ ! "$(ls -A $BACKUP_DIR/*.tar.gz 2>/dev/null)" ]; then
    echo -e "${RED}❌ 백업 파일이 없습니다!${NC}"
    echo -e "   먼저 백업을 생성하세요: ./scripts/backup.sh"
    exit 1
fi

# 백업 파일 선택
if [ -z "$1" ]; then
    echo -e "${YELLOW}📋 사용 가능한 백업 목록:${NC}"
    echo ""
    
    if [ -f "$BACKUP_LIST" ]; then
        cat "$BACKUP_LIST" | nl -w2 -s') ' | while IFS='|' read -r num timestamp type filename size; do
            echo -e "   ${GREEN}$num${NC} $timestamp [$type] $filename ($size)"
        done
    else
        ls -1t "$BACKUP_DIR"/*.tar.gz | nl -w2 -s') ' | sed 's|.*/||' | while read line; do
            echo -e "   ${GREEN}$line${NC}"
        done
    fi
    
    echo ""
    echo -e "${YELLOW}복원할 백업 번호를 입력하거나 파일명을 직접 지정하세요:${NC}"
    read -p "선택: " SELECTION
    
    if [[ "$SELECTION" =~ ^[0-9]+$ ]]; then
        # 번호로 선택
        if [ -f "$BACKUP_LIST" ]; then
            BACKUP_FILE=$(sed -n "${SELECTION}p" "$BACKUP_LIST" | cut -d'|' -f3)
        else
            BACKUP_FILE=$(ls -1t "$BACKUP_DIR"/*.tar.gz | sed -n "${SELECTION}p" | sed 's|.*/||')
        fi
    else
        # 파일명으로 선택
        BACKUP_FILE="$SELECTION"
    fi
else
    BACKUP_FILE="$1"
fi

# 파일 확장자 추가 (필요시)
if [[ "$BACKUP_FILE" != *.tar.gz ]]; then
    BACKUP_FILE="${BACKUP_FILE}.tar.gz"
fi

FULL_BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"

# 백업 파일 존재 확인
if [ ! -f "$FULL_BACKUP_PATH" ]; then
    echo -e "${RED}❌ 백업 파일을 찾을 수 없습니다: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  주의: 현재 프로젝트 상태가 복원으로 덮어씌워집니다!${NC}"
echo -e "${YELLOW}복원할 백업: $BACKUP_FILE${NC}"
read -p "계속하시겠습니까? (y/N): " CONFIRM

if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}복원이 취소되었습니다.${NC}"
    exit 0
fi

# 현재 상태 긴급 백업
echo -e "${YELLOW}📦 복원 전 긴급 백업 생성 중...${NC}"
EMERGENCY_BACKUP="$BACKUP_DIR/emergency-backup-$(date +%Y%m%d_%H%M%S).tar.gz"
cd "$PROJECT_ROOT/.."
tar -czf "$EMERGENCY_BACKUP" \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    --exclude='.project-backups' \
    finalmessage/ 2>/dev/null || true

echo -e "${GREEN}✅ 긴급 백업 생성 완료: $(basename "$EMERGENCY_BACKUP")${NC}"

# 복원 실행
echo -e "${YELLOW}🔄 프로젝트 복원 중...${NC}"
cd "$PROJECT_ROOT/.."

# 기존 파일 백업 후 삭제 (중요 파일 보호)
if [ -f "finalmessage/.env.local" ]; then
    cp "finalmessage/.env.local" "/tmp/.env.local.backup" 2>/dev/null || true
fi

# 복원 실행
tar -xzf "$FULL_BACKUP_PATH"

# 환경 파일 복구
if [ -f "/tmp/.env.local.backup" ]; then
    cp "/tmp/.env.local.backup" "finalmessage/.env.local"
    rm "/tmp/.env.local.backup" 2>/dev/null || true
fi

# 의존성 재설치
echo -e "${YELLOW}📦 의존성 재설치 중...${NC}"
cd "$PROJECT_ROOT"
npm install > /dev/null 2>&1 || echo -e "${YELLOW}⚠️  npm install 실패 - 수동으로 실행해주세요${NC}"

echo -e "${GREEN}✅ 프로젝트 복원 완료!${NC}"
echo -e "   📄 복원된 백업: $BACKUP_FILE"
echo -e "   🚨 긴급 백업: $(basename "$EMERGENCY_BACKUP")"
echo ""
echo -e "${BLUE}다음 명령어로 프로젝트를 확인하세요:${NC}"
echo -e "   cd $PROJECT_ROOT"
echo -e "   npm run dev"