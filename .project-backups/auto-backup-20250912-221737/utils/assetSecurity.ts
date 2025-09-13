/**
 * 자산 보안 유틸리티
 * 상속자에게 필요한 정보만 안전하게 표시
 */

export interface MaskedData {
  visible: string;    // 표시되는 부분
  masked: string;     // 마스킹된 전체 문자열
  isFullyVisible: boolean;  // 전체 공개 여부
}

/**
 * 계좌번호를 마스킹 처리
 * 예: "110-123-456789" → "110-***-******"
 */
export function maskAccountNumber(accountNumber: string): MaskedData {
  if (!accountNumber || accountNumber.length < 3) {
    return {
      visible: '',
      masked: '***',
      isFullyVisible: false
    };
  }

  const prefix = accountNumber.substring(0, 3);
  const masked = prefix + '*'.repeat(Math.max(0, accountNumber.length - 3));
  
  return {
    visible: prefix,
    masked: masked,
    isFullyVisible: false
  };
}

/**
 * 암호화폐 주소를 마스킹 처리
 * 예: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" → "1A1***...***DivfNa"
 */
export function maskCryptoAddress(address: string): MaskedData {
  if (!address || address.length < 8) {
    return {
      visible: '',
      masked: '***',
      isFullyVisible: false
    };
  }

  const prefix = address.substring(0, 3);
  const suffix = address.substring(address.length - 6);
  const masked = `${prefix}***...***${suffix}`;
  
  return {
    visible: `${prefix}...${suffix}`,
    masked: masked,
    isFullyVisible: false
  };
}

/**
 * 비밀번호를 마스킹 처리
 */
export function maskPassword(password: string): MaskedData {
  if (!password) {
    return {
      visible: '',
      masked: '',
      isFullyVisible: false
    };
  }

  return {
    visible: '',
    masked: '*'.repeat(Math.min(password.length, 8)),
    isFullyVisible: false
  };
}

/**
 * 시드구문을 마스킹 처리
 * 첫 3단어만 표시하고 나머지는 마스킹
 */
export function maskSeedPhrase(seedPhrase: string): MaskedData {
  if (!seedPhrase) {
    return {
      visible: '',
      masked: '*** *** ***...',
      isFullyVisible: false
    };
  }

  const words = seedPhrase.split(' ');
  if (words.length < 3) {
    return {
      visible: seedPhrase,
      masked: seedPhrase,
      isFullyVisible: true
    };
  }

  const visibleWords = words.slice(0, 3).join(' ');
  const hiddenCount = words.length - 3;
  const masked = `${visibleWords} ${'***'.repeat(Math.min(hiddenCount, 3))}...`;

  return {
    visible: visibleWords + '...',
    masked: masked,
    isFullyVisible: false
  };
}

/**
 * 이메일 주소를 마스킹 처리
 * 예: "user@example.com" → "u***@example.com"
 */
export function maskEmail(email: string): MaskedData {
  if (!email || !email.includes('@')) {
    return {
      visible: '',
      masked: '***@***.***',
      isFullyVisible: false
    };
  }

  const [localPart, domain] = email.split('@');
  if (localPart.length <= 1) {
    return {
      visible: email,
      masked: email,
      isFullyVisible: true
    };
  }

  const maskedLocal = localPart[0] + '*'.repeat(Math.max(0, localPart.length - 1));
  const masked = `${maskedLocal}@${domain}`;

  return {
    visible: `${localPart[0]}***@${domain}`,
    masked: masked,
    isFullyVisible: false
  };
}

/**
 * 해시태그 스타일링을 위한 파싱
 */
export function parseHashtags(tags: string[]): Array<{tag: string, color: string}> {
  // null 또는 undefined 체크 추가
  if (!tags || !Array.isArray(tags)) {
    return [];
  }

  const tagColors = {
    '주계좌': 'bg-blue-500/20 text-blue-400',
    '비상금': 'bg-red-500/20 text-red-400', 
    '투자': 'bg-green-500/20 text-green-400',
    '암호화폐': 'bg-amber-500/20 text-amber-400',
    '중요': 'bg-purple-500/20 text-purple-400',
    '가족': 'bg-pink-500/20 text-pink-400',
    '개인': 'bg-gray-500/20 text-gray-400'
  };

  return tags.map(tag => {
    const cleanTag = tag.startsWith('#') ? tag.substring(1) : tag;
    const color = tagColors[cleanTag] || 'bg-slate-500/20 text-slate-400';
    
    return {
      tag: cleanTag,
      color: color
    };
  });
}

/**
 * 중요도에 따른 보안 레벨 반환
 */
export function getSecurityLevel(importance: 'high' | 'medium' | 'low'): {
  level: number;
  description: string;
  color: string;
} {
  switch (importance) {
    case 'high':
      return {
        level: 3,
        description: '높은 보안 (추가 인증 필요)',
        color: 'text-red-400'
      };
    case 'medium':
      return {
        level: 2,
        description: '중간 보안 (비밀번호 필요)',
        color: 'text-amber-400'
      };
    case 'low':
      return {
        level: 1,
        description: '기본 보안',
        color: 'text-green-400'
      };
  }
}