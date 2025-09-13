#!/bin/bash

# 🛡️ FinalMessage 프로젝트 자동 백업 스크립트
# 사용법: ./scripts/backup.sh [backup-type]
# backup-type: daily, manual, pre-change

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/.project-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_TYPE=${1:-manual}

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛡️ FinalMessage 프로젝트 백업 시작...${NC}"

# 백업 디렉토리 생성
mkdir -p "$BACKUP_DIR"

# 백업 파일명 설정
case $BACKUP_TYPE in
    "daily")
        BACKUP_NAME="daily-backup-${TIMESTAMP}"
        ;;
    "pre-change")
        BACKUP_NAME="pre-change-backup-${TIMESTAMP}"
        ;;
    "manual")
        BACKUP_NAME="manual-backup-${TIMESTAMP}"
        ;;
    *)
        BACKUP_NAME="backup-${TIMESTAMP}"
        ;;
esac

BACKUP_FILE="$BACKUP_DIR/${BACKUP_NAME}.tar.gz"

echo -e "${YELLOW}📦 백업 생성 중: ${BACKUP_NAME}${NC}"

# 중요한 파일들만 백업 (node_modules, dist 제외)
cd "$PROJECT_ROOT/.."
tar -czf "$BACKUP_FILE" \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    --exclude='.project-backups' \
    --exclude='*.log' \
    --exclude='*.cache' \
    --exclude='AppData' \
    finalmessage/

# 백업 크기 확인
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo -e "${GREEN}✅ 백업 완료!${NC}"
echo -e "   📄 파일: ${BACKUP_FILE}"
echo -e "   📊 크기: ${BACKUP_SIZE}"

# 백업 목록 업데이트
BACKUP_LIST="$BACKUP_DIR/backup-list.txt"
echo "${TIMESTAMP}|${BACKUP_TYPE}|${BACKUP_NAME}.tar.gz|${BACKUP_SIZE}" >> "$BACKUP_LIST"

# 오래된 백업 정리 (30개 이상시 오래된 것 삭제)
cd "$BACKUP_DIR"
BACKUP_COUNT=$(ls -1 *.tar.gz 2>/dev/null | wc -l || echo 0)
if [ "$BACKUP_COUNT" -gt 30 ]; then
    echo -e "${YELLOW}🗑️  오래된 백업 정리 중...${NC}"
    ls -1t *.tar.gz | tail -n +31 | xargs rm -f
    echo -e "${GREEN}✅ 정리 완료${NC}"
fi

echo -e "${BLUE}🎉 백업 프로세스 완료!${NC}"

# 백업 목록 표시
echo -e "\n${BLUE}📋 최근 백업 목록:${NC}"
if [ -f "$BACKUP_LIST" ]; then
    tail -5 "$BACKUP_LIST" | while IFS='|' read -r timestamp type filename size; do
        echo -e "   ${GREEN}$timestamp${NC} [$type] $filename ($size)"
    done
fi