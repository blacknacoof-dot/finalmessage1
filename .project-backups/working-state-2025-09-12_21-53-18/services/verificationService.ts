import { BlockchainService } from './blockchainService';
import { WalletManager } from './walletManager';

export interface VerificationResult {
    isValid: boolean;
    timestamp: string;
    blockNumber?: number;
    transactionHash?: string;
    errorMessage?: string;
}

export interface InactivityTrigger {
    userId: string;
    lastActivity: string;
    inactivityPeriod: number; // days
    isTriggered: boolean;
    triggerDate?: string;
}

export interface VerifierNotification {
    verifierId: string;
    userId: string;
    message: string;
    type: 'email' | 'sms';
    status: 'pending' | 'sent' | 'failed';
    sentAt?: string;
}

export class VerificationService {
    private blockchainService: BlockchainService;
    private walletManager: WalletManager;
    
    constructor() {
        this.blockchainService = new BlockchainService();
        this.walletManager = new WalletManager();
    }

    /**
     * 메시지 무결성 검증 (사용자 친화적)
     */
    async verifyMessageIntegrity(userEmail: string, originalMessage: string): Promise<VerificationResult> {
        try {
            console.log(`🔍 메시지 무결성 검증 시작: ${userEmail}`);

            // 1. 사용자 지갑이 준비되어 있는지 확인
            const walletReady = await this.walletManager.ensureWalletReady(userEmail);
            if (!walletReady) {
                return {
                    isValid: false,
                    timestamp: new Date().toISOString(),
                    errorMessage: '지갑 시스템에 접근할 수 없습니다.'
                };
            }

            // 2. 블록체인에서 저장된 해시 가져오기
            const storedHash = await this.blockchainService.getStoredHash(userEmail);
            
            if (!storedHash) {
                return {
                    isValid: false,
                    timestamp: new Date().toISOString(),
                    errorMessage: '저장된 메시지 해시를 찾을 수 없습니다.'
                };
            }

            // 3. 원본 메시지로 해시 계산 (EncryptionService 사용)
            const { EncryptionService } = await import('../utils/encryption');
            const computedHash = await EncryptionService.generateMessageHash(originalMessage);

            // 4. 해시 비교
            const isValid = storedHash === computedHash;

            // 5. 트랜잭션 정보 추가
            const transactions = this.blockchainService.getTransactionRecords(userEmail);
            const latestTx = transactions[transactions.length - 1];

            const result: VerificationResult = {
                isValid,
                timestamp: new Date().toISOString(),
                blockNumber: latestTx?.blockNumber,
                transactionHash: latestTx?.transactionHash,
                errorMessage: isValid ? undefined : '메시지가 변조되었을 가능성이 있습니다.'
            };

            console.log(`✅ 검증 완료: ${isValid ? '성공' : '실패'}`);
            return result;

        } catch (error: any) {
            console.error('메시지 검증 실패:', error);
            return {
                isValid: false,
                timestamp: new Date().toISOString(),
                errorMessage: `검증 중 오류 발생: ${error.message}`
            };
        }
    }

    /**
     * 사용자 활동 상태 확인
     */
    checkUserActivity(userId: string, inactivityPeriodDays: number = 365): InactivityTrigger {
        const lastActivityStr = localStorage.getItem(`finalmessage_lastActivity_${userId}`) || new Date().toISOString();
        const lastActivity = new Date(lastActivityStr);
        const now = new Date();
        
        const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        const isTriggered = daysSinceActivity >= inactivityPeriodDays;

        const result: InactivityTrigger = {
            userId,
            lastActivity: lastActivity.toISOString(),
            inactivityPeriod: inactivityPeriodDays,
            isTriggered
        };

        if (isTriggered) {
            result.triggerDate = new Date(lastActivity.getTime() + (inactivityPeriodDays * 24 * 60 * 60 * 1000)).toISOString();
        }

        return result;
    }

    /**
     * 사용자 활동 업데이트 (체크인)
     */
    updateUserActivity(userId: string): void {
        const now = new Date().toISOString();
        localStorage.setItem(`finalmessage_lastActivity_${userId}`, now);
        
        // 블록체인에도 업데이트 (선택사항)
        this.updateActivityOnBlockchain(userId).catch(console.error);
    }

    /**
     * 블록체인에 활동 상태 업데이트
     */
    private async updateActivityOnBlockchain(userId: string): Promise<void> {
        try {
            // 실제로는 스마트 컨트랙트의 updateActivity() 호출
            console.log(`사용자 ${userId}의 활동 상태를 블록체인에 업데이트했습니다.`);
        } catch (error) {
            console.error('블록체인 활동 업데이트 실패:', error);
        }
    }

    /**
     * 검증자들에게 알림 발송
     */
    async notifyVerifiers(userId: string, verifiers: string[], message: string): Promise<VerifierNotification[]> {
        const notifications: VerifierNotification[] = [];

        for (const verifierId of verifiers) {
            const notification: VerifierNotification = {
                verifierId,
                userId,
                message,
                type: 'email', // 기본값
                status: 'pending'
            };

            try {
                // 실제로는 이메일/SMS 서비스 호출
                await this.sendNotification(notification);
                notification.status = 'sent';
                notification.sentAt = new Date().toISOString();
            } catch (error) {
                notification.status = 'failed';
            }

            notifications.push(notification);
        }

        return notifications;
    }

    /**
     * 알림 발송 (이메일/SMS)
     */
    private async sendNotification(notification: VerifierNotification): Promise<void> {
        // 실제 구현에서는 SendGrid, Twilio 등 사용
        console.log('알림 발송:', notification);
        
        // 시뮬레이션을 위한 지연
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (Math.random() < 0.9) { // 90% 성공률
            console.log(`✅ 알림 발송 성공: ${notification.verifierId}`);
        } else {
            throw new Error('알림 발송 실패');
        }
    }

    /**
     * 검증 프로세스 시작
     */
    async startVerificationProcess(userId: string): Promise<{
        success: boolean;
        processId: string;
        message: string;
    }> {
        try {
            const processId = `verification_${userId}_${Date.now()}`;
            
            // 1. 비활성 상태 확인
            const inactivityCheck = this.checkUserActivity(userId);
            if (!inactivityCheck.isTriggered) {
                return {
                    success: false,
                    processId: '',
                    message: '사용자가 아직 활성 상태입니다.'
                };
            }

            // 2. 검증자 목록 가져오기
            const verifiers = JSON.parse(localStorage.getItem(`finalmessage_verifiers_${userId}`) || '[]');
            if (verifiers.length === 0) {
                return {
                    success: false,
                    processId: '',
                    message: '등록된 검증자가 없습니다.'
                };
            }

            // 3. 검증자들에게 알림 발송
            const notifications = await this.notifyVerifiers(
                userId, 
                verifiers.map((v: any) => v.id),
                `${userId} 사용자의 유산 메시지 검증이 필요합니다.`
            );

            // 4. 검증 프로세스 상태 저장
            const processData = {
                processId,
                userId,
                startDate: new Date().toISOString(),
                status: 'pending',
                verifiers: verifiers.map((v: any) => v.id),
                notifications,
                completedVerifications: []
            };

            localStorage.setItem(`verification_process_${processId}`, JSON.stringify(processData));

            return {
                success: true,
                processId,
                message: `검증 프로세스가 시작되었습니다. ${verifiers.length}명의 검증자에게 알림을 발송했습니다.`
            };

        } catch (error: any) {
            return {
                success: false,
                processId: '',
                message: `검증 프로세스 시작 실패: ${error.message}`
            };
        }
    }

    /**
     * 검증자의 검증 완료 처리
     */
    async completeVerification(processId: string, verifierId: string, verificationData: any): Promise<{
        success: boolean;
        message: string;
        allCompleted: boolean;
    }> {
        try {
            const processDataStr = localStorage.getItem(`verification_process_${processId}`);
            if (!processDataStr) {
                return {
                    success: false,
                    message: '검증 프로세스를 찾을 수 없습니다.',
                    allCompleted: false
                };
            }

            const processData = JSON.parse(processDataStr);
            
            // 검증 완료 기록
            processData.completedVerifications.push({
                verifierId,
                completedAt: new Date().toISOString(),
                data: verificationData
            });

            // 모든 검증자가 완료했는지 확인
            const allCompleted = processData.verifiers.length === processData.completedVerifications.length;
            
            if (allCompleted) {
                processData.status = 'completed';
                processData.completedAt = new Date().toISOString();
                
                // 메시지 배포 트리거
                await this.triggerMessageRelease(processData.userId, processData);
            }

            // 상태 저장
            localStorage.setItem(`verification_process_${processId}`, JSON.stringify(processData));

            return {
                success: true,
                message: allCompleted ? '모든 검증이 완료되었습니다. 메시지가 배포됩니다.' : '검증이 완료되었습니다.',
                allCompleted
            };

        } catch (error: any) {
            return {
                success: false,
                message: `검증 완료 처리 실패: ${error.message}`,
                allCompleted: false
            };
        }
    }

    /**
     * 메시지 배포 트리거
     */
    private async triggerMessageRelease(userId: string, processData: any): Promise<void> {
        try {
            console.log(`🚀 메시지 배포 시작: 사용자 ${userId}`);
            
            // 1. 메시지 무결성 최종 검증
            const message = localStorage.getItem(`finalmessage_message_${userId}`) || '';
            const verificationResult = await this.verifyMessageIntegrity(userId, message);
            
            if (!verificationResult.isValid) {
                throw new Error('메시지 무결성 검증 실패');
            }

            // 2. 검증자들에게 최종 메시지 전송
            const verifiers = JSON.parse(localStorage.getItem(`finalmessage_verifiers_${userId}`) || '[]');
            await this.deliverFinalMessage(userId, verifiers, message);

            // 3. 배포 완료 기록
            const deliveryRecord = {
                userId,
                deliveredAt: new Date().toISOString(),
                verificationProcess: processData.processId,
                messageHash: verificationResult,
                recipients: verifiers.map((v: any) => v.id)
            };

            localStorage.setItem(`message_delivery_${userId}`, JSON.stringify(deliveryRecord));
            
            console.log('✅ 메시지 배포 완료');

        } catch (error: any) {
            console.error('❌ 메시지 배포 실패:', error);
            throw error;
        }
    }

    /**
     * 검증자들에게 최종 메시지 전달
     */
    private async deliverFinalMessage(userId: string, verifiers: any[], message: string): Promise<void> {
        const deliveryPromises = verifiers.map(async (verifier) => {
            try {
                // 실제로는 암호화된 메시지를 이메일로 전송
                console.log(`📧 메시지 전달: ${verifier.name} (${verifier.email})`);
                
                // 메시지 전달 시뮬레이션
                await new Promise(resolve => setTimeout(resolve, 500));
                
                return {
                    verifierId: verifier.id,
                    status: 'delivered',
                    deliveredAt: new Date().toISOString()
                };
            } catch (error) {
                return {
                    verifierId: verifier.id,
                    status: 'failed',
                    error: error
                };
            }
        });

        const results = await Promise.all(deliveryPromises);
        console.log('📊 메시지 전달 결과:', results);
    }

    /**
     * 검증 프로세스 상태 조회
     */
    getVerificationStatus(processId: string): any {
        const processDataStr = localStorage.getItem(`verification_process_${processId}`);
        return processDataStr ? JSON.parse(processDataStr) : null;
    }

    /**
     * 사용자의 모든 검증 프로세스 조회
     */
    getUserVerificationProcesses(userId: string): any[] {
        const processes = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('verification_process_')) {
                const data = JSON.parse(localStorage.getItem(key) || '{}');
                if (data.userId === userId) {
                    processes.push(data);
                }
            }
        }
        return processes.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }
}