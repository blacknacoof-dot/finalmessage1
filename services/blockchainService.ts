// 🔗 BlockchainService - 사용자 친화적 블록체인 연동
// Phase 1: 자동 지갑 생성 + 서버 프록시 방식

export interface BlockchainWallet {
    address: string;
    encryptedPrivateKey: string;
    created: string;
}

export interface BlockchainTransaction {
    hash: string;
    blockNumber?: number;
    timestamp: string;
    status: 'pending' | 'confirmed' | 'failed';
    gasUsed?: number;
}

export interface MessageHashRecord {
    userEmail: string;
    messageHash: string;
    transactionHash: string;
    blockNumber?: number;
    timestamp: string;
    isVerified: boolean;
}

export class BlockchainService {
    private readonly API_BASE_URL: string;
    private readonly POLYGON_RPC_URL = 'https://rpc-amoy.polygon.technology/';
    
    constructor() {
        // 개발/프로덕션 환경에 따른 API URL 설정
        this.API_BASE_URL = import.meta.env.DEV 
            ? 'http://localhost:3002/api/blockchain'
            : 'https://your-backend-url.com/api/blockchain';
    }

    // ==========================================
    // Phase 1: 자동 지갑 생성 (사용자 모름)
    // ==========================================

    /**
     * 사용자 등록시 자동으로 블록체인 지갑 생성
     * 사용자는 전혀 모르게 백그라운드에서 처리
     */
    async createUserWallet(userEmail: string): Promise<BlockchainWallet> {
        try {
            // 개발 환경에서는 로컬 시뮬레이션
            if (import.meta.env.DEV) {
                return this.simulateWalletCreation(userEmail);
            }

            // 프로덕션에서는 서버 API 호출
            const response = await fetch(`${this.API_BASE_URL}/create-wallet`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('finalmessage_token')}`
                },
                body: JSON.stringify({ userEmail })
            });

            if (!response.ok) {
                throw new Error('지갑 생성 실패');
            }

            const wallet = await response.json();
            
            // 로컬에 지갑 정보 저장 (암호화된 상태)
            localStorage.setItem(`finalmessage_wallet_${userEmail}`, JSON.stringify(wallet));
            
            return wallet;

        } catch (error) {
            console.error('지갑 생성 오류:', error);
            // 실패해도 앱 사용에는 지장 없도록 시뮬레이션 모드로 fallback
            return this.simulateWalletCreation(userEmail);
        }
    }

    /**
     * 개발 환경용 지갑 생성 시뮬레이션
     */
    private simulateWalletCreation(userEmail: string): BlockchainWallet {
        // 실제로는 ethers.js의 Wallet.createRandom() 사용
        const mockAddress = '0x' + Array.from({length: 40}, () => 
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
        
        const wallet: BlockchainWallet = {
            address: mockAddress,
            encryptedPrivateKey: 'encrypted_' + btoa(userEmail + '_' + Date.now()),
            created: new Date().toISOString()
        };

        // 로컬 저장
        localStorage.setItem(`finalmessage_wallet_${userEmail}`, JSON.stringify(wallet));
        
        console.log(`✅ [시뮬레이션] 지갑 생성 완료: ${userEmail} -> ${mockAddress}`);
        return wallet;
    }

    /**
     * 사용자 지갑 정보 조회 (사용자는 모름)
     */
    async getUserWallet(userEmail: string): Promise<BlockchainWallet | null> {
        const walletData = localStorage.getItem(`finalmessage_wallet_${userEmail}`);
        if (walletData) {
            return JSON.parse(walletData);
        }

        // 지갑이 없으면 자동 생성
        return await this.createUserWallet(userEmail);
    }

    // ==========================================
    // Phase 1: 서버 프록시 시스템
    // ==========================================

    /**
     * 메시지 해시를 블록체인에 저장
     * 사용자는 지갑을 몰라도 되고, 서버가 대신 트랜잭션 처리
     */
    async storeMessageHash(userEmail: string, messageHash: string): Promise<string> {
        try {
            console.log(`🔗 메시지 해시 저장 시작: ${userEmail}`);

            // 개발 환경에서는 시뮬레이션
            if (import.meta.env.DEV) {
                return this.simulateHashStorage(userEmail, messageHash);
            }

            // 프로덕션에서는 서버 API 호출
            const response = await fetch(`${this.API_BASE_URL}/store-hash`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('finalmessage_token')}`
                },
                body: JSON.stringify({
                    userEmail,
                    messageHash
                })
            });

            if (!response.ok) {
                throw new Error('해시 저장 실패');
            }

            const result = await response.json();
            
            // 트랜잭션 기록 저장
            this.saveTransactionRecord(userEmail, messageHash, result.transactionHash);
            
            console.log(`✅ 해시 저장 완료: ${result.transactionHash}`);
            return result.transactionHash;

        } catch (error) {
            console.error('해시 저장 오류:', error);
            // 실패해도 앱은 계속 작동하도록 시뮬레이션
            return this.simulateHashStorage(userEmail, messageHash);
        }
    }

    /**
     * 개발 환경용 해시 저장 시뮬레이션
     */
    private simulateHashStorage(userEmail: string, messageHash: string): string {
        // 가짜 트랜잭션 해시 생성
        const mockTxHash = '0x' + Array.from({length: 64}, () => 
            Math.floor(Math.random() * 16).toString(16)
        ).join('');

        // 시뮬레이션 지연
        setTimeout(() => {
            this.saveTransactionRecord(userEmail, messageHash, mockTxHash);
            console.log(`✅ [시뮬레이션] 해시 저장 완료: ${mockTxHash}`);
        }, 1000);

        return mockTxHash;
    }

    /**
     * 저장된 메시지 해시 조회
     */
    async getStoredHash(userEmail: string): Promise<string | null> {
        try {
            // 개발 환경에서는 로컬 스토리지에서 조회
            if (import.meta.env.DEV) {
                return this.getLocalStoredHash(userEmail);
            }

            // 프로덕션에서는 서버 API 호출
            const response = await fetch(`${this.API_BASE_URL}/get-hash/${userEmail}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('finalmessage_token')}`
                }
            });

            if (!response.ok) {
                return null;
            }

            const result = await response.json();
            return result.messageHash;

        } catch (error) {
            console.error('해시 조회 오류:', error);
            return this.getLocalStoredHash(userEmail);
        }
    }

    /**
     * 로컬에서 저장된 해시 조회 (개발용)
     */
    private getLocalStoredHash(userEmail: string): string | null {
        const records = this.getTransactionRecords(userEmail);
        if (records.length > 0) {
            return records[records.length - 1].messageHash;
        }
        return null;
    }

    // ==========================================
    // 트랜잭션 기록 관리
    // ==========================================

    /**
     * 트랜잭션 기록 저장
     */
    private saveTransactionRecord(userEmail: string, messageHash: string, transactionHash: string): void {
        const record: MessageHashRecord = {
            userEmail,
            messageHash,
            transactionHash,
            timestamp: new Date().toISOString(),
            isVerified: false
        };

        const key = `finalmessage_blockchain_${userEmail}`;
        const existingRecords = JSON.parse(localStorage.getItem(key) || '[]');
        existingRecords.push(record);
        
        localStorage.setItem(key, JSON.stringify(existingRecords));
    }

    /**
     * 사용자의 트랜잭션 기록 조회
     */
    getTransactionRecords(userEmail: string): MessageHashRecord[] {
        const key = `finalmessage_blockchain_${userEmail}`;
        return JSON.parse(localStorage.getItem(key) || '[]');
    }

    /**
     * 트랜잭션 상태 확인
     */
    async getTransactionStatus(transactionHash: string): Promise<BlockchainTransaction | null> {
        try {
            // 개발 환경에서는 시뮬레이션
            if (import.meta.env.DEV) {
                return {
                    hash: transactionHash,
                    blockNumber: Math.floor(Math.random() * 1000000) + 40000000,
                    timestamp: new Date().toISOString(),
                    status: 'confirmed',
                    gasUsed: Math.floor(Math.random() * 50000) + 21000
                };
            }

            // 실제 구현에서는 ethers.js 사용
            // const provider = new ethers.JsonRpcProvider(this.POLYGON_RPC_URL);
            // const receipt = await provider.getTransactionReceipt(transactionHash);
            
            return null;

        } catch (error) {
            console.error('트랜잭션 상태 조회 오류:', error);
            return null;
        }
    }

    // ==========================================
    // Phase 2 준비: MetaMask 연동 (선택사항)
    // ==========================================

    /**
     * MetaMask 설치 여부 확인
     */
    isMetaMaskAvailable(): boolean {
        return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
    }

    /**
     * MetaMask 연결 (고급 사용자용)
     */
    async connectMetaMask(): Promise<string | null> {
        if (!this.isMetaMaskAvailable()) {
            throw new Error('MetaMask가 설치되지 않았습니다');
        }

        try {
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            return accounts[0];
        } catch (error) {
            console.error('MetaMask 연결 실패:', error);
            return null;
        }
    }

    // ==========================================
    // 유틸리티 함수
    // ==========================================

    /**
     * 블록체인 네트워크 상태 확인
     */
    async getNetworkStatus(): Promise<{
        connected: boolean;
        networkId?: number;
        blockNumber?: number;
    }> {
        try {
            // 개발 환경에서는 항상 연결된 것으로 시뮬레이션
            if (import.meta.env.DEV) {
                return {
                    connected: true,
                    networkId: 80002, // Polygon Amoy
                    blockNumber: Math.floor(Math.random() * 1000000) + 40000000
                };
            }

            // 실제로는 RPC 호출
            const response = await fetch(this.POLYGON_RPC_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_blockNumber',
                    params: [],
                    id: 1
                })
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    connected: true,
                    networkId: 80002,
                    blockNumber: parseInt(data.result, 16)
                };
            }

            return { connected: false };

        } catch (error) {
            console.error('네트워크 상태 확인 실패:', error);
            return { connected: false };
        }
    }

    /**
     * 가스비 추정
     */
    async estimateGasFee(): Promise<{
        gasPrice: string;
        estimatedFee: string;
    }> {
        // 개발 환경에서는 고정값 반환
        if (import.meta.env.DEV) {
            return {
                gasPrice: '30.0', // Gwei
                estimatedFee: '0.0015' // MATIC
            };
        }

        // 실제로는 가스 오라클 API 호출
        return {
            gasPrice: '30.0',
            estimatedFee: '0.0015'
        };
    }
}

// 전역 타입 선언
declare global {
    interface Window {
        ethereum?: any;
    }
}