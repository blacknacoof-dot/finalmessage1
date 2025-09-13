import React, { useState, useEffect } from 'react';
import { EncryptionService, MessageSecurity } from '../utils/encryption';
import { 
    ShieldCheckIcon, 
    LockClosedIcon, 
    LockOpenIcon,
    EyeIcon,
    EyeSlashIcon,
    KeyIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from './icons';

interface SecurityManagerProps {
    language: 'en' | 'ko';
    messageId: string;
    messageContent: string;
    onSecurityUpdate: (security: MessageSecurity) => void;
    initialSecurity?: MessageSecurity;
}

const translations = {
    en: {
        title: 'Message Security Settings',
        encryption: 'Encryption',
        blockchain: 'Blockchain Verification',
        lockStatus: 'Lock Status',
        enableEncryption: 'Enable Encryption',
        encryptionPassword: 'Encryption Password',
        confirmPassword: 'Confirm Password',
        enableBlockchain: 'Enable Blockchain Verification',
        lockMessage: 'Lock Message',
        unlockMessage: 'Unlock Message',
        messageEncrypted: 'Message Encrypted',
        messageDecrypted: 'Message Decrypted',
        blockchainVerified: 'Blockchain Verified',
        messageLocked: 'Message Locked',
        messageUnlocked: 'Message Unlocked',
        encrypt: 'Encrypt',
        decrypt: 'Decrypt',
        verify: 'Verify on Blockchain',
        lock: 'Lock',
        unlock: 'Unlock',
        showPassword: 'Show Password',
        hidePassword: 'Hide Password',
        passwordRequired: 'Password is required for encryption',
        passwordMismatch: 'Passwords do not match',
        encryptionSuccess: 'Message encrypted successfully',
        decryptionSuccess: 'Message decrypted successfully',
        blockchainSuccess: 'Blockchain verification completed',
        lockSuccess: 'Message locked successfully',
        unlockSuccess: 'Message unlocked successfully',
        deliveryStatus: 'Delivery Status',
        pending: 'Pending',
        scheduled: 'Scheduled',
        delivered: 'Delivered',
        cannotModify: 'Cannot modify - message has been delivered',
        securityLevel: 'Security Level',
        basic: 'Basic',
        encrypted: 'Encrypted',
        blockchainSecured: 'Blockchain Secured',
        fullySecured: 'Fully Secured'
    },
    ko: {
        title: '메시지 보안 설정',
        encryption: '암호화',
        blockchain: '블록체인 검증',
        lockStatus: '잠금 상태',
        enableEncryption: '암호화 사용',
        encryptionPassword: '암호화 패스워드',
        confirmPassword: '패스워드 확인',
        enableBlockchain: '블록체인 검증 사용',
        lockMessage: '메시지 잠금',
        unlockMessage: '메시지 잠금 해제',
        messageEncrypted: '메시지 암호화됨',
        messageDecrypted: '메시지 복호화됨',
        blockchainVerified: '블록체인 검증됨',
        messageLocked: '메시지 잠금됨',
        messageUnlocked: '메시지 잠금 해제됨',
        encrypt: '암호화',
        decrypt: '복호화',
        verify: '블록체인 검증',
        lock: '잠금',
        unlock: '잠금 해제',
        showPassword: '패스워드 보기',
        hidePassword: '패스워드 숨기기',
        passwordRequired: '암호화를 위해 패스워드가 필요합니다',
        passwordMismatch: '패스워드가 일치하지 않습니다',
        encryptionSuccess: '메시지가 성공적으로 암호화되었습니다',
        decryptionSuccess: '메시지가 성공적으로 복호화되었습니다',
        blockchainSuccess: '블록체인 검증이 완료되었습니다',
        lockSuccess: '메시지가 성공적으로 잠금되었습니다',
        unlockSuccess: '메시지 잠금이 성공적으로 해제되었습니다',
        deliveryStatus: '배송 상태',
        pending: '대기 중',
        scheduled: '예약됨',
        delivered: '배송됨',
        cannotModify: '수정 불가 - 메시지가 이미 배송되었습니다',
        securityLevel: '보안 수준',
        basic: '기본',
        encrypted: '암호화됨',
        blockchainSecured: '블록체인 보안',
        fullySecured: '완전 보안'
    }
};

export const SecurityManager: React.FC<SecurityManagerProps> = ({
    language,
    messageId,
    messageContent,
    onSecurityUpdate,
    initialSecurity
}) => {
    const t = translations[language];
    
    const [security, setSecurity] = useState<MessageSecurity>(initialSecurity || {
        encrypted: false,
        blockchainVerified: false,
        locked: false,
        deliveryStatus: 'pending',
        integrityHash: ''
    });

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // 초기 무결성 해시 생성
        if (!security.integrityHash && messageContent) {
            generateIntegrityHash();
        }
    }, [messageContent]);

    const generateIntegrityHash = async () => {
        try {
            const hash = await EncryptionService.generateMessageHash(messageContent);
            const updatedSecurity = { ...security, integrityHash: hash };
            setSecurity(updatedSecurity);
            onSecurityUpdate(updatedSecurity);
        } catch (error) {
            console.error('Failed to generate integrity hash:', error);
        }
    };

    const handleEncryption = async () => {
        if (!password) {
            setMessage(t.passwordRequired);
            return;
        }

        if (password !== confirmPassword) {
            setMessage(t.passwordMismatch);
            return;
        }

        setLoading(true);
        try {
            if (security.encrypted) {
                // 복호화
                if (security.encryptionData) {
                    await EncryptionService.decryptMessage(
                        security.encryptionData.encryptedContent,
                        security.encryptionData.iv,
                        security.encryptionData.salt,
                        security.encryptionData.tag,
                        password
                    );
                    
                    const updatedSecurity = {
                        ...security,
                        encrypted: false,
                        encryptionData: undefined
                    };
                    setSecurity(updatedSecurity);
                    onSecurityUpdate(updatedSecurity);
                    setMessage(t.decryptionSuccess);
                }
            } else {
                // 암호화
                const encryptionResult = await EncryptionService.encryptMessage(messageContent, password);
                const updatedSecurity = {
                    ...security,
                    encrypted: true,
                    encryptionData: {
                        encryptedContent: encryptionResult.encryptedData,
                        iv: encryptionResult.iv,
                        salt: encryptionResult.salt,
                        tag: encryptionResult.tag
                    }
                };
                setSecurity(updatedSecurity);
                onSecurityUpdate(updatedSecurity);
                setMessage(t.encryptionSuccess);
            }
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Operation failed');
        } finally {
            setLoading(false);
            setPassword('');
            setConfirmPassword('');
        }
    };

    const handleBlockchainVerification = async () => {
        setLoading(true);
        try {
            const messageHash = await EncryptionService.generateMessageHash(messageContent);
            const previousHash = security.blockchainData?.hash || '0000000000000000000000000000000000000000000000000000000000000000';
            const timestamp = Date.now();
            
            const blockchainResult = await EncryptionService.generateBlockchainHash(
                previousHash,
                messageHash,
                timestamp
            );

            const updatedSecurity = {
                ...security,
                blockchainVerified: true,
                blockchainData: {
                    hash: blockchainResult.hash,
                    previousHash,
                    nonce: blockchainResult.nonce,
                    timestamp
                }
            };
            
            setSecurity(updatedSecurity);
            onSecurityUpdate(updatedSecurity);
            setMessage(t.blockchainSuccess);
        } catch (error) {
            setMessage('Blockchain verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLockToggle = () => {
        if (security.deliveryStatus === 'delivered') {
            setMessage(t.cannotModify);
            return;
        }

        const updatedSecurity = {
            ...security,
            locked: !security.locked
        };
        
        setSecurity(updatedSecurity);
        onSecurityUpdate(updatedSecurity);
        setMessage(security.locked ? t.unlockSuccess : t.lockSuccess);
    };

    const getSecurityLevel = () => {
        if (security.encrypted && security.blockchainVerified && security.locked) {
            return { level: t.fullySecured, color: 'text-green-400', bgColor: 'bg-green-900/30' };
        } else if (security.encrypted && security.blockchainVerified) {
            return { level: t.blockchainSecured, color: 'text-blue-400', bgColor: 'bg-blue-900/30' };
        } else if (security.encrypted) {
            return { level: t.encrypted, color: 'text-yellow-400', bgColor: 'bg-yellow-900/30' };
        }
        return { level: t.basic, color: 'text-slate-400', bgColor: 'bg-slate-900/30' };
    };

    const securityLevel = getSecurityLevel();
    const canModify = security.deliveryStatus !== 'delivered';

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center gap-3">
                <ShieldCheckIcon className="w-6 h-6 text-sky-400" />
                <h3 className="text-xl font-semibold text-white">{t.title}</h3>
            </div>

            {/* 보안 수준 표시 */}
            <div className={`p-4 rounded-xl border border-slate-700 ${securityLevel.bgColor}`}>
                <div className="flex items-center justify-between">
                    <span className="text-slate-300">{t.securityLevel}</span>
                    <span className={`font-semibold ${securityLevel.color}`}>
                        {securityLevel.level}
                    </span>
                </div>
            </div>

            {/* 배송 상태 */}
            <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/50">
                <div className="flex items-center justify-between">
                    <span className="text-slate-300">{t.deliveryStatus}</span>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                            security.deliveryStatus === 'pending' ? 'bg-yellow-400' :
                            security.deliveryStatus === 'scheduled' ? 'bg-blue-400' :
                            'bg-green-400'
                        }`} />
                        <span className="text-white font-medium">
                            {security.deliveryStatus === 'pending' ? t.pending :
                             security.deliveryStatus === 'scheduled' ? t.scheduled : t.delivered}
                        </span>
                    </div>
                </div>
            </div>

            {/* 메시지 알림 */}
            {message && (
                <div className={`p-4 rounded-xl border ${
                    message.includes('실패') || message.includes('failed') || message.includes('불가')
                        ? 'border-red-600 bg-red-900/30 text-red-300'
                        : 'border-green-600 bg-green-900/30 text-green-300'
                }`}>
                    <div className="flex items-center gap-2">
                        {message.includes('실패') || message.includes('failed') || message.includes('불가') ? (
                            <ExclamationTriangleIcon className="w-5 h-5" />
                        ) : (
                            <CheckCircleIcon className="w-5 h-5" />
                        )}
                        <span>{message}</span>
                    </div>
                </div>
            )}

            {/* 암호화 섹션 */}
            <div className="p-6 rounded-xl border border-slate-700 bg-slate-800/50">
                <div className="flex items-center gap-3 mb-4">
                    <KeyIcon className="w-5 h-5 text-yellow-400" />
                    <h4 className="text-lg font-medium text-white">{t.encryption}</h4>
                    <div className="ml-auto flex items-center gap-2">
                        {security.encrypted ? (
                            <LockClosedIcon className="w-5 h-5 text-green-400" />
                        ) : (
                            <LockOpenIcon className="w-5 h-5 text-slate-400" />
                        )}
                        <span className={security.encrypted ? 'text-green-400' : 'text-slate-400'}>
                            {security.encrypted ? t.messageEncrypted : t.messageDecrypted}
                        </span>
                    </div>
                </div>

                {canModify && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    {t.encryptionPassword}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                        placeholder="Enter password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="w-5 h-5" />
                                        ) : (
                                            <EyeIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    {t.confirmPassword}
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                    placeholder="Confirm password"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleEncryption}
                            disabled={loading}
                            className="w-full px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
                        >
                            {loading ? '처리 중...' : (security.encrypted ? t.decrypt : t.encrypt)}
                        </button>
                    </div>
                )}
            </div>

            {/* 블록체인 검증 섹션 */}
            <div className="p-6 rounded-xl border border-slate-700 bg-slate-800/50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-5 h-5 bg-blue-400 rounded-sm" />
                    <h4 className="text-lg font-medium text-white">{t.blockchain}</h4>
                    <div className="ml-auto flex items-center gap-2">
                        {security.blockchainVerified ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-400" />
                        ) : (
                            <ExclamationTriangleIcon className="w-5 h-5 text-slate-400" />
                        )}
                        <span className={security.blockchainVerified ? 'text-green-400' : 'text-slate-400'}>
                            {security.blockchainVerified ? t.blockchainVerified : 'Not Verified'}
                        </span>
                    </div>
                </div>

                {security.blockchainData && (
                    <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                        <div className="text-xs text-slate-400 mb-1">Block Hash:</div>
                        <div className="text-xs text-green-400 font-mono break-all">
                            {security.blockchainData.hash}
                        </div>
                        <div className="text-xs text-slate-400 mt-2">
                            Nonce: {security.blockchainData.nonce} | 
                            Timestamp: {new Date(security.blockchainData.timestamp).toLocaleString()}
                        </div>
                    </div>
                )}

                {canModify && !security.blockchainVerified && (
                    <button
                        onClick={handleBlockchainVerification}
                        disabled={loading}
                        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
                    >
                        {loading ? '검증 중...' : t.verify}
                    </button>
                )}
            </div>

            {/* 잠금 섹션 */}
            <div className="p-6 rounded-xl border border-slate-700 bg-slate-800/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <LockClosedIcon className="w-5 h-5 text-red-400" />
                        <h4 className="text-lg font-medium text-white">{t.lockStatus}</h4>
                    </div>
                    
                    {canModify && (
                        <button
                            onClick={handleLockToggle}
                            className={`px-6 py-2 font-semibold rounded-lg transition-colors ${
                                security.locked
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-slate-600 hover:bg-slate-700 text-white'
                            }`}
                        >
                            {security.locked ? t.unlock : t.lock}
                        </button>
                    )}
                </div>
                
                <div className="mt-3">
                    <span className={`text-sm ${security.locked ? 'text-red-400' : 'text-slate-400'}`}>
                        {security.locked ? t.messageLocked : t.messageUnlocked}
                    </span>
                </div>
            </div>
        </div>
    );
};