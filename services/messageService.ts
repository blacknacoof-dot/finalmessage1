// 📝 MessageService - 메시지 저장시 자동 블록체인 해시 저장
// 사용자는 블록체인을 전혀 몰라도 자동으로 보안 처리

import { BlockchainService } from './blockchainService';
import { WalletManager } from './walletManager';
import { EncryptionService } from '../utils/encryption';

export interface MessageData {
    id: string;
    title: string;
    content: string;
    userEmail: string;
    createdAt: string;
    updatedAt: string;
    isEncrypted: boolean;
    blockchainHash?: string;
    transactionHash?: string;
    isBlockchainVerified: boolean;
}

export interface SaveMessageResult {
    success: boolean;
    messageId: string;
    blockchainHash?: string;
    transactionHash?: string;
    message: string;
}

export class MessageService {
    private blockchainService: BlockchainService;
    private walletManager: WalletManager;

    constructor() {
        this.blockchainService = new BlockchainService();
        this.walletManager = new WalletManager();
    }

    // ==========================================
    // 메시지 저장 (자동 블록체인 연동)
    // ==========================================

    /**
     * 메시지 저장시 자동으로 블록체인에 해시 저장
     * 사용자는 블록체인 처리를 전혀 알 필요 없음
     */
    async saveMessage(
        userEmail: string, 
        title: string, 
        content: string, 
        encrypt: boolean = true
    ): Promise<SaveMessageResult> {
        try {
            console.log(`📝 메시지 저장 시작: ${userEmail}`);

            // 1. 고유 메시지 ID 생성
            const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // 2. 지갑 준비 (사용자 모름)
            console.log('🔐 지갑 시스템 준비 중...');
            await this.walletManager.ensureWalletReady(userEmail);

            // 3. 메시지 암호화 (선택사항)
            let finalContent = content;
            let encryptionData = null;

            if (encrypt) {
                console.log('🔒 메시지 암호화 중...');
                encryptionData = await EncryptionService.encryptMessage(content, userEmail);
                finalContent = JSON.stringify(encryptionData);
            }

            // 4. 메시지 해시 생성
            const messageHash = await EncryptionService.generateMessageHash(content);
            console.log(`🔍 메시지 해시: ${messageHash.substring(0, 10)}...`);

            // 5. 블록체인에 해시 저장 (백그라운드)
            let transactionHash: string | undefined;
            try {
                console.log('🔗 블록체인 해시 저장 중...');
                transactionHash = await this.blockchainService.storeMessageHash(userEmail, messageHash);
                console.log(`✅ 블록체인 저장 완료: ${transactionHash.substring(0, 10)}...`);
            } catch (blockchainError) {
                console.warn('⚠️ 블록체인 저장 실패, 로컬 저장 계속:', blockchainError);
                // 블록체인 실패해도 메시지 저장은 계속
            }

            // 6. 메시지 데이터 구성
            const messageData: MessageData = {
                id: messageId,
                title,
                content: finalContent,
                userEmail,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isEncrypted: encrypt,
                blockchainHash: messageHash,
                transactionHash,
                isBlockchainVerified: !!transactionHash
            };

            // 7. 로컬 저장
            this.saveMessageLocally(messageData);

            // 8. 결과 반환
            const result: SaveMessageResult = {
                success: true,
                messageId,
                blockchainHash: messageHash,
                transactionHash,
                message: transactionHash 
                    ? '메시지가 블록체인에 안전하게 저장되었습니다' 
                    : '메시지가 저장되었습니다 (블록체인 백업 대기 중)'
            };

            console.log('✅ 메시지 저장 완료');
            return result;

        } catch (error: any) {
            console.error('메시지 저장 실패:', error);
            return {
                success: false,
                messageId: '',
                message: `메시지 저장 실패: ${error.message}`
            };
        }
    }

    /**
     * 메시지 로컬 저장
     */
    private saveMessageLocally(messageData: MessageData): void {
        const key = `finalmessage_messages_${messageData.userEmail}`;
        const existingMessages = JSON.parse(localStorage.getItem(key) || '[]');
        
        existingMessages.unshift(messageData); // 최신 메시지가 앞에
        
        // 최대 100개 메시지만 유지
        if (existingMessages.length > 100) {
            existingMessages.splice(100);
        }
        
        localStorage.setItem(key, JSON.stringify(existingMessages));
    }

    // ==========================================
    // 메시지 조회 및 복호화
    // ==========================================

    /**
     * 사용자의 모든 메시지 조회
     */
    getUserMessages(userEmail: string): MessageData[] {
        const key = `finalmessage_messages_${userEmail}`;
        return JSON.parse(localStorage.getItem(key) || '[]');
    }

    /**
     * 특정 메시지 조회 및 복호화
     */
    async getMessage(userEmail: string, messageId: string): Promise<{
        success: boolean;
        message?: MessageData;
        decryptedContent?: string;
        error?: string;
    }> {
        try {
            const messages = this.getUserMessages(userEmail);
            const message = messages.find(msg => msg.id === messageId);
            
            if (!message) {
                return {
                    success: false,
                    error: '메시지를 찾을 수 없습니다'
                };
            }

            let decryptedContent = message.content;
            
            // 암호화된 메시지면 복호화
            if (message.isEncrypted) {
                try {
                    const encryptionData = JSON.parse(message.content);
                    decryptedContent = await EncryptionService.decryptMessage(
                        encryptionData.encryptedData,
                        encryptionData.iv,
                        encryptionData.salt,
                        encryptionData.tag,
                        userEmail
                    );
                } catch (decryptError) {
                    console.error('복호화 실패:', decryptError);
                    return {
                        success: false,
                        error: '메시지 복호화에 실패했습니다'
                    };
                }
            }

            return {
                success: true,
                message,
                decryptedContent
            };

        } catch (error: any) {
            return {
                success: false,
                error: `메시지 조회 실패: ${error.message}`
            };
        }
    }

    // ==========================================
    // 블록체인 검증
    // ==========================================

    /**
     * 메시지 무결성 검증 (블록체인 활용)
     */
    async verifyMessageIntegrity(userEmail: string, messageId: string): Promise<{
        success: boolean;
        isValid?: boolean;
        blockchainVerified?: boolean;
        transactionHash?: string;
        message: string;
    }> {
        try {
            // 메시지 조회
            const messageResult = await this.getMessage(userEmail, messageId);
            
            if (!messageResult.success) {
                return {
                    success: false,
                    message: messageResult.error || '메시지 조회 실패'
                };
            }

            const message = messageResult.message!;
            const originalContent = messageResult.decryptedContent!;

            // 블록체인 검증 서비스 사용
            const { VerificationService } = await import('./verificationService');
            const verificationService = new VerificationService();
            
            const verifyResult = await verificationService.verifyMessageIntegrity(userEmail, originalContent);

            return {
                success: true,
                isValid: verifyResult.isValid,
                blockchainVerified: message.isBlockchainVerified,
                transactionHash: message.transactionHash,
                message: verifyResult.isValid 
                    ? '메시지 무결성이 확인되었습니다' 
                    : '메시지가 변조되었을 가능성이 있습니다'
            };

        } catch (error: any) {
            return {
                success: false,
                message: `검증 실패: ${error.message}`
            };
        }
    }

    // ==========================================
    // 메시지 관리
    // ==========================================

    /**
     * 메시지 삭제
     */
    deleteMessage(userEmail: string, messageId: string): boolean {
        try {
            const messages = this.getUserMessages(userEmail);
            const filteredMessages = messages.filter(msg => msg.id !== messageId);
            
            const key = `finalmessage_messages_${userEmail}`;
            localStorage.setItem(key, JSON.stringify(filteredMessages));
            
            return true;
        } catch (error) {
            console.error('메시지 삭제 실패:', error);
            return false;
        }
    }

    /**
     * 메시지 업데이트
     */
    async updateMessage(
        userEmail: string, 
        messageId: string, 
        newTitle: string, 
        newContent: string
    ): Promise<SaveMessageResult> {
        try {
            // 기존 메시지 삭제
            this.deleteMessage(userEmail, messageId);
            
            // 새 메시지로 저장
            return await this.saveMessage(userEmail, newTitle, newContent);
            
        } catch (error: any) {
            return {
                success: false,
                messageId: '',
                message: `메시지 업데이트 실패: ${error.message}`
            };
        }
    }

    // ==========================================
    // 통계 및 정보
    // ==========================================

    /**
     * 사용자 메시지 통계
     */
    async getMessageStats(userEmail: string): Promise<{
        totalMessages: number;
        encryptedMessages: number;
        blockchainVerifiedMessages: number;
        oldestMessage?: string;
        newestMessage?: string;
        walletStatus: any;
    }> {
        const messages = this.getUserMessages(userEmail);
        const walletStatus = await this.walletManager.getWalletSummary(userEmail);
        
        return {
            totalMessages: messages.length,
            encryptedMessages: messages.filter(msg => msg.isEncrypted).length,
            blockchainVerifiedMessages: messages.filter(msg => msg.isBlockchainVerified).length,
            oldestMessage: messages.length > 0 ? messages[messages.length - 1].createdAt : undefined,
            newestMessage: messages.length > 0 ? messages[0].createdAt : undefined,
            walletStatus
        };
    }
}