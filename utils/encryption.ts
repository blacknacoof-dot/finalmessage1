// AES-256-GCM 암호화 유틸리티
export class EncryptionService {
    private static async generateKey(): Promise<CryptoKey> {
        return await crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256,
            },
            true,
            ['encrypt', 'decrypt']
        );
    }

    private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
        const passwordBuffer = new TextEncoder().encode(password);
        const baseKey = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            'PBKDF2',
            false,
            ['deriveKey']
        );

        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256',
            },
            baseKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    // 메시지 암호화
    static async encryptMessage(message: string, userPassword?: string): Promise<{
        encryptedData: string;
        iv: string;
        salt: string;
        tag: string;
    }> {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(message);
            
            // 랜덤 salt와 IV 생성
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(12));
            
            let key: CryptoKey;
            if (userPassword) {
                key = await this.deriveKey(userPassword, salt);
            } else {
                key = await this.generateKey();
            }

            const encrypted = await crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                },
                key,
                data
            );

            const encryptedArray = new Uint8Array(encrypted);
            const tag = encryptedArray.slice(-16); // GCM tag is last 16 bytes
            const ciphertext = encryptedArray.slice(0, -16);

            return {
                encryptedData: Array.from(ciphertext).map(b => b.toString(16).padStart(2, '0')).join(''),
                iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
                salt: Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join(''),
                tag: Array.from(tag).map(b => b.toString(16).padStart(2, '0')).join('')
            };
        } catch (error) {
            console.error('Encryption failed:', error);
            throw new Error('암호화에 실패했습니다.');
        }
    }

    // 메시지 복호화
    static async decryptMessage(
        encryptedData: string,
        iv: string,
        salt: string,
        tag: string,
        userPassword?: string
    ): Promise<string> {
        try {
            const ciphertext = new Uint8Array(
                encryptedData.match(/.{2}/g)?.map(hex => parseInt(hex, 16)) || []
            );
            const ivArray = new Uint8Array(
                iv.match(/.{2}/g)?.map(hex => parseInt(hex, 16)) || []
            );
            const saltArray = new Uint8Array(
                salt.match(/.{2}/g)?.map(hex => parseInt(hex, 16)) || []
            );
            const tagArray = new Uint8Array(
                tag.match(/.{2}/g)?.map(hex => parseInt(hex, 16)) || []
            );

            let key: CryptoKey;
            if (userPassword) {
                key = await this.deriveKey(userPassword, saltArray);
            } else {
                throw new Error('Password required for decryption');
            }

            // Combine ciphertext and tag for GCM
            const encryptedWithTag = new Uint8Array(ciphertext.length + tagArray.length);
            encryptedWithTag.set(ciphertext);
            encryptedWithTag.set(tagArray, ciphertext.length);

            const decrypted = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: ivArray,
                },
                key,
                encryptedWithTag
            );

            return new TextDecoder().decode(decrypted);
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('복호화에 실패했습니다. 패스워드를 확인해주세요.');
        }
    }

    // 메시지 해시 생성 (무결성 검증용)
    static async generateMessageHash(message: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // 블록체인 스타일 해시 체인 생성
    static async generateBlockchainHash(
        previousHash: string,
        messageHash: string,
        timestamp: number,
        nonce: number = 0
    ): Promise<{ hash: string; nonce: number }> {
        const blockData = `${previousHash}${messageHash}${timestamp}${nonce}`;
        let hash = await this.generateMessageHash(blockData);
        
        // Proof of Work (간단한 버전 - 해시가 0으로 시작하도록)
        while (!hash.startsWith('0000')) {
            nonce++;
            const newBlockData = `${previousHash}${messageHash}${timestamp}${nonce}`;
            hash = await this.generateMessageHash(newBlockData);
        }

        return { hash, nonce };
    }
}

// 메시지 보안 상태 타입
export interface MessageSecurity {
    encrypted: boolean;
    blockchainVerified: boolean;
    locked: boolean;
    deliveryStatus: 'pending' | 'scheduled' | 'delivered';
    encryptionData?: {
        encryptedContent: string;
        iv: string;
        salt: string;
        tag: string;
    };
    blockchainData?: {
        hash: string;
        previousHash: string;
        nonce: number;
        timestamp: number;
    };
    integrityHash: string;
}