// API 서비스 유틸리티
const API_BASE_URL = 'https://finalmessage-backend.loca.lt/api';

// 토큰 관리
export const getAuthToken = (): string | null => {
    return localStorage.getItem('finalmessage_token');
};

export const setAuthToken = (token: string): void => {
    localStorage.setItem('finalmessage_token', token);
};

export const removeAuthToken = (): void => {
    localStorage.removeItem('finalmessage_token');
};

// API 요청 헬퍼
const apiRequest = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    
    const config: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    };

    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    return response.json();
};

// 메시지 타입 정의
export interface Message {
    id: number;
    title: string;
    content: string;
    recipientEmails: string[];
    deliveryDate: string;
    isDelivered: boolean;
    verificationHash: string;
    requiresLegalNotary: boolean;
    createdAt: string;
    updatedAt: string;
    isSecurityLocked?: boolean; // 보안강화 잠금 상태
    beneficiaries?: Beneficiary[]; // 상속자 목록
}

export interface Beneficiary {
    id: string;
    name: string;
    email: string;
    relationship: string;
    phone?: string;
    address?: string;
    inheritanceShare?: number; // 상속 비율 (%)
    notes?: string; // 추가 메모
}

export interface CreateMessageRequest {
    title: string;
    content: string;
    recipientEmails: string[];
    deliveryDate: string;
    requireLegalNotary?: boolean;
    beneficiaries?: Beneficiary[]; // 상속자 목록
}

export interface UpdateMessageRequest {
    title?: string;
    content?: string;
    recipientEmails?: string[];
    deliveryDate?: string;
    beneficiaries?: Beneficiary[]; // 상속자 목록
}

// 메시지 API
export const messageAPI = {
    // 메시지 목록 조회
    getMessages: async (page = 1, limit = 10): Promise<{
        success: boolean;
        messages: Message[];
        pagination: {
            page: number;
            limit: number;
            totalCount: number;
            totalPages: number;
        };
    }> => {
        return apiRequest(`/messages?page=${page}&limit=${limit}`);
    },

    // 메시지 생성
    createMessage: async (messageData: CreateMessageRequest): Promise<{
        success: boolean;
        message: Message;
    }> => {
        return apiRequest('/messages', {
            method: 'POST',
            body: JSON.stringify(messageData),
        });
    },

    // 메시지 조회
    getMessage: async (id: number): Promise<{
        success: boolean;
        message: Message;
    }> => {
        return apiRequest(`/messages/${id}`);
    },

    // 메시지 업데이트
    updateMessage: async (id: number, messageData: UpdateMessageRequest): Promise<{
        success: boolean;
        message: string;
    }> => {
        return apiRequest(`/messages/${id}`, {
            method: 'PUT',
            body: JSON.stringify(messageData),
        });
    },

    // 메시지 삭제
    deleteMessage: async (id: number): Promise<{
        success: boolean;
        message: string;
    }> => {
        return apiRequest(`/messages/${id}`, {
            method: 'DELETE',
        });
    },

    // 메시지 검증
    verifyMessage: async (id: number): Promise<{
        success: boolean;
        verification: {
            isValid: boolean;
            originalHash: string;
            calculatedHash: string;
            blockchainTxHash?: string;
            isBlockchainVerified: boolean;
            verificationDate?: string;
        };
    }> => {
        return apiRequest(`/messages/${id}/verify`);
    },
};

// 인증 API
export const authAPI = {
    // 회원가입
    signup: async (userData: {
        email: string;
        password: string;
        name: string;
    }): Promise<{
        success: boolean;
        user: any;
        token: string;
    }> => {
        return apiRequest('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    // 로그인
    login: async (credentials: {
        email: string;
        password: string;
    }): Promise<{
        success: boolean;
        user: any;
        token: string;
    }> => {
        return apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    },

    // 로그아웃
    logout: async (): Promise<{
        success: boolean;
    }> => {
        return apiRequest('/auth/logout', {
            method: 'POST',
        });
    },

    // 프로필 조회
    getProfile: async (): Promise<{
        success: boolean;
        user: any;
    }> => {
        return apiRequest('/auth/profile');
    },
};

// 구독 API
export const subscriptionAPI = {
    // 요금제 목록 조회
    getPlans: async (): Promise<{
        success: boolean;
        plans: any[];
    }> => {
        return apiRequest('/subscription/plans');
    },

    // 구독 상태 조회
    getStatus: async (): Promise<{
        success: boolean;
        subscription: any;
    }> => {
        return apiRequest('/subscription/status');
    },

    // 구독 생성
    subscribe: async (planId: number): Promise<{
        success: boolean;
        subscription: any;
    }> => {
        return apiRequest('/subscription/subscribe', {
            method: 'POST',
            body: JSON.stringify({ planId }),
        });
    },
};