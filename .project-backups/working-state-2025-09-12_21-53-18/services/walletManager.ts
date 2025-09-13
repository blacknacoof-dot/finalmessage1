// 🔐 WalletManager - 자동 지갑 생성 및 관리 시스템
// 사용자는 지갑 존재를 전혀 모르게 처리

import { BlockchainService, BlockchainWallet } from './blockchainService';
import { EncryptionService } from '../utils/encryption';

export interface UserWalletInfo {
    userEmail: string;
    hasWallet: boolean;
    walletAddress?: string;
    createdAt?: string;
    isActive: boolean;
}

export class WalletManager {
    private blockchainService: BlockchainService;

    constructor() {
        this.blockchainService = new BlockchainService();
    }

    // ==========================================
    // 자동 지갑 생성 (사용자 회원가입시)
    // ==========================================

    /**
     * 사용자 회원가입시 자동으로 지갑 생성
     * 사용자는 전혀 알 필요 없음
     */
    async setupUserWallet(userEmail: string): Promise<{
        success: boolean;
        walletAddress?: string;
        message: string;
    }> {
        try {
            console.log(`🔐 사용자 지갑 설정 시작: ${userEmail}`);

            // 이미 지갑이 있는지 확인
            const existingWallet = await this.blockchainService.getUserWallet(userEmail);
            
            if (existingWallet) {
                console.log(`✅ 기존 지갑 발견: ${existingWallet.address}`);
                return {
                    success: true,
                    walletAddress: existingWallet.address,
                    message: '기존 지갑 연결 완료'
                };
            }

            // 새 지갑 생성
            const newWallet = await this.blockchainService.createUserWallet(userEmail);
            
            // 지갑 정보를 안전하게 저장
            await this.saveWalletInfo(userEmail, newWallet);
            
            console.log(`✅ 새 지갑 생성 완료: ${newWallet.address}`);
            return {
                success: true,
                walletAddress: newWallet.address,
                message: '새 지갑 생성 완료'
            };

        } catch (error) {
            console.error('지갑 설정 실패:', error);
            return {
                success: false,
                message: '지갑 설정 실패 (백업 모드로 전환)'
            };
        }
    }

    /**
     * 지갑 정보를 안전하게 저장
     */
    private async saveWalletInfo(userEmail: string, wallet: BlockchainWallet): Promise<void> {
        const walletInfo: UserWalletInfo = {
            userEmail,
            hasWallet: true,
            walletAddress: wallet.address,
            createdAt: wallet.created,
            isActive: true
        };

        // 지갑 정보를 암호화하여 저장
        const encryptedInfo = await EncryptionService.encryptMessage(
            JSON.stringify(walletInfo),
            userEmail // 사용자 이메일을 키로 사용
        );

        localStorage.setItem(
            `finalmessage_wallet_info_${userEmail}`, 
            JSON.stringify(encryptedInfo)
        );
    }

    /**
     * 사용자 지갑 정보 조회 (복호화)
     */
    async getUserWalletInfo(userEmail: string): Promise<UserWalletInfo | null> {
        try {
            const encryptedData = localStorage.getItem(`finalmessage_wallet_info_${userEmail}`);
            
            if (!encryptedData) {
                return null;
            }

            const encryptedInfo = JSON.parse(encryptedData);
            
            const decryptedInfo = await EncryptionService.decryptMessage(
                encryptedInfo.encryptedData,
                encryptedInfo.iv,
                encryptedInfo.salt,
                encryptedInfo.tag,
                userEmail
            );

            return JSON.parse(decryptedInfo);

        } catch (error) {
            console.error('지갑 정보 조회 실패:', error);
            return null;
        }
    }

    // ==========================================
    // 지갑 상태 관리
    // ==========================================

    /**
     * 사용자가 블록체인 기능을 사용할 수 있는지 확인
     */
    async canUseBlockchainFeatures(userEmail: string): Promise<{
        canUse: boolean;
        reason?: string;
        walletAddress?: string;
    }> {
        try {
            // 지갑 정보 확인
            const walletInfo = await this.getUserWalletInfo(userEmail);
            
            if (!walletInfo || !walletInfo.hasWallet) {
                // 지갑이 없으면 자동 생성 시도
                const setupResult = await this.setupUserWallet(userEmail);
                
                if (setupResult.success) {
                    return {
                        canUse: true,
                        walletAddress: setupResult.walletAddress
                    };
                } else {
                    return {
                        canUse: false,
                        reason: '지갑 생성 실패'
                    };
                }
            }

            // 네트워크 상태 확인
            const networkStatus = await this.blockchainService.getNetworkStatus();
            
            if (!networkStatus.connected) {
                return {
                    canUse: false,
                    reason: '블록체인 네트워크 연결 실패',
                    walletAddress: walletInfo.walletAddress
                };
            }

            return {
                canUse: true,
                walletAddress: walletInfo.walletAddress
            };

        } catch (error) {
            console.error('블록체인 기능 확인 실패:', error);
            return {
                canUse: false,
                reason: '시스템 오류'
            };
        }
    }

    /**
     * 지갑 상태 체크 및 자동 복구
     */
    async ensureWalletReady(userEmail: string): Promise<boolean> {
        try {
            const canUse = await this.canUseBlockchainFeatures(userEmail);
            
            if (canUse.canUse) {
                console.log(`✅ 지갑 준비 완료: ${canUse.walletAddress}`);
                return true;
            } else {
                console.warn(`⚠️ 지갑 사용 불가: ${canUse.reason}`);
                
                // 자동 복구 시도
                if (canUse.reason === '지갑 생성 실패') {
                    console.log('🔧 지갑 재생성 시도...');
                    const retryResult = await this.setupUserWallet(userEmail);
                    return retryResult.success;
                }
                
                return false;
            }

        } catch (error) {
            console.error('지갑 준비 확인 실패:', error);
            return false;
        }
    }

    // ==========================================
    // 개발/디버깅 용도
    // ==========================================

    /**
     * 현재 사용자의 지갑 상태 요약
     */
    async getWalletSummary(userEmail: string): Promise<{
        hasWallet: boolean;
        walletAddress?: string;
        networkConnected: boolean;
        transactionCount: number;
        canUseFeatures: boolean;
    }> {
        try {
            const walletInfo = await this.getUserWalletInfo(userEmail);
            const networkStatus = await this.blockchainService.getNetworkStatus();
            const transactions = this.blockchainService.getTransactionRecords(userEmail);
            const canUse = await this.canUseBlockchainFeatures(userEmail);

            return {
                hasWallet: walletInfo?.hasWallet || false,
                walletAddress: walletInfo?.walletAddress,
                networkConnected: networkStatus.connected,
                transactionCount: transactions.length,
                canUseFeatures: canUse.canUse
            };

        } catch (error) {
            console.error('지갑 요약 조회 실패:', error);
            return {
                hasWallet: false,
                networkConnected: false,
                transactionCount: 0,
                canUseFeatures: false
            };
        }
    }

    /**
     * 지갑 정보 초기화 (개발/테스트 용도)
     */
    async resetUserWallet(userEmail: string): Promise<boolean> {
        try {
            // 저장된 지갑 정보 삭제
            localStorage.removeItem(`finalmessage_wallet_${userEmail}`);
            localStorage.removeItem(`finalmessage_wallet_info_${userEmail}`);
            localStorage.removeItem(`finalmessage_blockchain_${userEmail}`);
            
            console.log(`🗑️ 지갑 정보 초기화 완료: ${userEmail}`);
            return true;

        } catch (error) {
            console.error('지갑 초기화 실패:', error);
            return false;
        }
    }

    // ==========================================
    // Phase 2 준비: MetaMask 연동 지원
    // ==========================================

    /**
     * 고급 사용자용 MetaMask 지갑 연결
     */
    async connectExternalWallet(userEmail: string): Promise<{
        success: boolean;
        walletType: 'metamask' | 'auto-generated';
        walletAddress?: string;
        message: string;
    }> {
        try {
            // MetaMask 사용 가능 여부 확인
            if (this.blockchainService.isMetaMaskAvailable()) {
                const metaMaskAddress = await this.blockchainService.connectMetaMask();
                
                if (metaMaskAddress) {
                    // MetaMask 주소 저장
                    const walletInfo: UserWalletInfo = {
                        userEmail,
                        hasWallet: true,
                        walletAddress: metaMaskAddress,
                        createdAt: new Date().toISOString(),
                        isActive: true
                    };

                    await this.saveWalletInfo(userEmail, {
                        address: metaMaskAddress,
                        encryptedPrivateKey: 'metamask_external',
                        created: new Date().toISOString()
                    });

                    return {
                        success: true,
                        walletType: 'metamask',
                        walletAddress: metaMaskAddress,
                        message: 'MetaMask 연결 완료'
                    };
                }
            }

            // MetaMask가 없거나 연결 실패시 자동 지갑 사용
            const autoWallet = await this.setupUserWallet(userEmail);
            
            return {
                success: autoWallet.success,
                walletType: 'auto-generated',
                walletAddress: autoWallet.walletAddress,
                message: autoWallet.message
            };

        } catch (error) {
            console.error('외부 지갑 연결 실패:', error);
            return {
                success: false,
                walletType: 'auto-generated',
                message: '지갑 연결 실패'
            };
        }
    }
}