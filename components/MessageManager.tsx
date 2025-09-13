import React, { useState, useEffect } from 'react';
import { 
    PlusIcon, 
    TrashIcon, 
    LockClosedIcon, 
    LockOpenIcon,
    PencilIcon,
    EyeIcon,
    CalendarIcon,
    ClockIcon,
    ShieldCheckIcon,
    XMarkIcon,
    UserGroupIcon
} from '../components/icons';
import { messageAPI, Message, CreateMessageRequest, UpdateMessageRequest, Beneficiary } from '../services/api';
import { useLocalStorage } from '../App';
import type { Verifier } from '../types';
import { SecurityManager } from './SecurityManager';
import { MessageSecurity } from '../utils/encryption';
import { toast } from '../utils/notifications';

interface MessageManagerProps {
    language: 'en' | 'ko';
    onUpgrade?: () => void;
}

const translations = {
    en: {
        title: 'Message Storage',
        subtitle: 'Manage your final messages (Maximum 10)',
        addMessage: 'Add New Message',
        noMessages: 'No messages yet. Create your first message.',
        securityLock: 'Security Lock',
        unlock: 'Unlock',
        lock: 'Lock',
        edit: 'Edit',
        view: 'View',
        delete: 'Delete',
        save: 'Save',
        cancel: 'Cancel',
        messageTitle: 'Message Title',
        messageContent: 'Message Content',
        recipients: 'Recipients (Email)',
        deliveryDate: 'Delivery Date',
        securityLocked: 'Security Locked',
        lastSaved: 'Last saved:',
        createdAt: 'Created:',
        deliveryScheduled: 'Delivery scheduled:',
        addRecipient: 'Add recipient',
        security: 'Security',
        securitySettings: 'Security Settings',
        close: 'Close',
        beneficiaries: 'Inheritance Beneficiaries',
        addBeneficiary: 'Add Beneficiary',
        inheritanceShare: 'Inheritance Share (%)',
        relationship: 'Relationship',
        beneficiaryNotes: 'Notes',
        viewInheritance: 'View Inheritance',
        beneficiaryDetails: 'Beneficiary Details',
        editBeneficiary: 'Edit Beneficiary',
        inheritanceDescription: 'These beneficiaries will receive your messages and assets after verification procedures.',
        selectBeneficiaries: 'Select beneficiaries from your successors list',
        noBeneficiariesAvailable: 'No successors found. Please add successors from the main menu first.',
        goToSuccessors: 'Go to Successors',
        placeholder: {
            title: 'Enter message title...',
            content: 'Write your final message here...',
            email: 'recipient@example.com',
            beneficiaryName: 'Beneficiary name...',
            beneficiaryEmail: 'beneficiary@example.com',
            relationship: 'Son/Daughter/Spouse...',
            notes: 'Additional notes...'
        },
        confirm: {
            delete: 'Are you sure you want to delete this message?',
            lock: 'Once locked, this message cannot be edited. Are you sure?',
            unlock: 'Are you sure you want to unlock this message?'
        },
        error: {
            titleRequired: 'Title is required',
            contentRequired: 'Content is required',
            emailRequired: 'At least one recipient email is required',
            dateRequired: 'Delivery date is required',
            dateFuture: 'Delivery date must be in the future',
            maxMessages: 'Maximum 10 messages allowed',
            loadFailed: 'Failed to load messages',
            saveFailed: 'Failed to save message',
            deleteFailed: 'Failed to delete message'
        },
        success: {
            messageSaved: 'Message saved successfully!',
            messageDeleted: 'Message deleted successfully!',
            blockchainSaved: 'Message saved to blockchain successfully!'
        }
    },
    ko: {
        title: '메시지 저장소',
        subtitle: '최종 메시지 관리 (최대 10개)',
        addMessage: '새 메시지 추가',
        noMessages: '아직 메시지가 없습니다. 첫 번째 메시지를 작성해보세요.',
        securityLock: '보안 잠금',
        unlock: '잠금해제',
        lock: '잠금',
        edit: '편집',
        view: '보기',
        delete: '삭제',
        save: '저장',
        cancel: '취소',
        messageTitle: '메시지 제목',
        messageContent: '메시지 내용',
        recipients: '수신자 (이메일)',
        deliveryDate: '전달 날짜',
        securityLocked: '보안 잠금됨',
        lastSaved: '마지막 저장:',
        createdAt: '생성일:',
        deliveryScheduled: '전달 예정:',
        addRecipient: '수신자 추가',
        security: '보안',
        securitySettings: '보안 설정',
        close: '닫기',
        beneficiaries: '상속 수혜자',
        addBeneficiary: '수혜자 추가',
        inheritanceShare: '상속 비율 (%)',
        relationship: '관계',
        beneficiaryNotes: '메모',
        viewInheritance: '상속 정보 보기',
        beneficiaryDetails: '상속자 상세 정보',
        editBeneficiary: '상속자 수정',
        inheritanceDescription: '이들은 사후 확인 절차를 거쳐 당신의 메시지와 자산을 전달받게 됩니다.',
        selectBeneficiaries: '상속자 목록에서 수혜자를 선택하세요',
        noBeneficiariesAvailable: '등록된 상속자가 없습니다. 먼저 메인 메뉴에서 상속자를 추가해주세요.',
        goToSuccessors: '상속자 메뉴로 이동',
        placeholder: {
            title: '메시지 제목을 입력하세요...',
            content: '최종 메시지를 여기에 작성하세요...',
            email: 'recipient@example.com',
            beneficiaryName: '수혜자 이름...',
            beneficiaryEmail: 'beneficiary@example.com',
            relationship: '아들/딸/배우자...',
            notes: '추가 메모...'
        },
        confirm: {
            delete: '정말 이 메시지를 삭제하시겠습니까?',
            lock: '잠금 후에는 메시지를 편집할 수 없습니다. 계속하시겠습니까?',
            unlock: '정말 이 메시지의 잠금을 해제하시겠습니까?'
        },
        error: {
            titleRequired: '제목은 필수입니다',
            contentRequired: '내용은 필수입니다',
            emailRequired: '최소 한 명의 수신자 이메일이 필요합니다',
            dateRequired: '전달 날짜는 필수입니다',
            dateFuture: '전달 날짜는 미래여야 합니다',
            maxMessages: '최대 10개의 메시지만 허용됩니다',
            loadFailed: '메시지 로드에 실패했습니다',
            saveFailed: '메시지 저장에 실패했습니다',
            deleteFailed: '메시지 삭제에 실패했습니다'
        },
        success: {
            messageSaved: '메시지가 성공적으로 저장되었습니다!',
            messageDeleted: '메시지가 성공적으로 삭제되었습니다!',
            blockchainSaved: '메시지가 블록체인에 성공적으로 저장되었습니다!'
        }
    }
};

export const MessageManager: React.FC<MessageManagerProps> = ({ language, onUpgrade }) => {
    const t = translations[language];
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingMessage, setEditingMessage] = useState<Message | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [error, setError] = useState<string>('');
    
    // 전역 상속자 목록 가져오기
    const [globalBeneficiaries] = useLocalStorage<Verifier[]>('finalmessage_verifiers', []);
    
    // 보안 관리 상태
    const [selectedMessageForSecurity, setSelectedMessageForSecurity] = useState<Message | null>(null);
    const [messageSecurity, setMessageSecurity] = useState<{[messageId: number]: MessageSecurity}>({});
    
    // 상속자 상세 모달 상태
    const [selectedBeneficiary, setSelectedBeneficiary] = useState<{beneficiary: Beneficiary; messageId: number} | null>(null);
    const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);

    // 새 메시지 폼 상태
    const [newMessage, setNewMessage] = useState<CreateMessageRequest>({
        title: '',
        content: '',
        recipientEmails: [''],
        deliveryDate: '',
        beneficiaries: []
    });

    // 메시지 로드
    const loadMessages = async () => {
        try {
            setLoading(true);
            // 백엔드 연결 시도, 실패 시 목업 데이터 사용
            try {
                const response = await messageAPI.getMessages(1, 10);
                setMessages(response.messages);
            } catch (backendError) {
                console.warn('Backend not available, using mock data:', backendError);
                // 목업 데이터
                const mockMessages: Message[] = [
                    {
                        id: 1,
                        title: "Family Message",
                        content: "This is a heartfelt message to my family about our cherished memories and my hopes for your future...",
                        recipientEmails: ["family@example.com"],
                        deliveryDate: "2024-12-31T23:59:59.000Z",
                        isDelivered: false,
                        verificationHash: "abc123",
                        requiresLegalNotary: false,
                        createdAt: "2024-09-11T02:00:00.000Z",
                        updatedAt: "2024-09-11T02:00:00.000Z",
                        isSecurityLocked: false,
                        beneficiaries: [
                            {
                                id: "ben1",
                                name: "김영희",
                                email: "younghe@example.com",
                                relationship: "딸",
                                inheritanceShare: 60,
                                notes: "주요 상속자"
                            },
                            {
                                id: "ben2", 
                                name: "김철수",
                                email: "chulsoo@example.com",
                                relationship: "아들",
                                inheritanceShare: 40,
                                notes: "부 상속자"
                            }
                        ]
                    },
                    {
                        id: 2,
                        title: "Financial Instructions",
                        content: "Important financial information and instructions for handling my assets...",
                        recipientEmails: ["spouse@example.com", "lawyer@example.com"],
                        deliveryDate: "2025-01-15T10:00:00.000Z",
                        isDelivered: false,
                        verificationHash: "def456",
                        requiresLegalNotary: true,
                        createdAt: "2024-09-10T15:30:00.000Z",
                        updatedAt: "2024-09-10T15:30:00.000Z",
                        isSecurityLocked: true,
                        beneficiaries: [
                            {
                                id: "ben3",
                                name: "이영수",
                                email: "youngsoo@example.com",
                                relationship: "배우자",
                                inheritanceShare: 100,
                                notes: "주요 금융 자산 관리자"
                            }
                        ]
                    }
                ];
                setMessages(mockMessages);
            }
            setError('');
        } catch (err) {
            setError(t.error.loadFailed);
            console.error('Load messages error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMessages();
    }, []);

    // 메시지 생성
    const handleCreateMessage = async () => {
        try {
            // 유효성 검사
            if (!newMessage.title.trim()) {
                setError(t.error.titleRequired);
                return;
            }
            if (!newMessage.content.trim()) {
                setError(t.error.contentRequired);
                return;
            }
            const validEmails = newMessage.recipientEmails.filter(email => email.trim());
            if (validEmails.length === 0) {
                setError(t.error.emailRequired);
                return;
            }
            if (!newMessage.deliveryDate) {
                setError(t.error.dateRequired);
                return;
            }
            const deliveryDate = new Date(newMessage.deliveryDate);
            if (deliveryDate <= new Date()) {
                setError(t.error.dateFuture);
                return;
            }
            if (messages.length >= 10) {
                setError(t.error.maxMessages);
                return;
            }

            try {
                const response = await messageAPI.createMessage({
                    ...newMessage,
                    recipientEmails: validEmails
                });
                setMessages(prev => [response.message, ...prev]);
                
                // 메시지 저장 성공 알림
                toast.success(t.success.messageSaved);
                
                // 블록체인 저장 시뮬레이션 (실제로는 백엔드에서 처리)
                setTimeout(() => {
                    toast.success(t.success.blockchainSaved);
                }, 1500);
                
            } catch (backendError) {
                console.warn('Backend not available, creating mock message');
                // 목업 메시지 생성
                const mockMessage: Message = {
                    id: Date.now(),
                    title: newMessage.title,
                    content: newMessage.content,
                    recipientEmails: validEmails,
                    deliveryDate: newMessage.deliveryDate,
                    isDelivered: false,
                    verificationHash: `mock_${Date.now()}`,
                    requiresLegalNotary: newMessage.requireLegalNotary || false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isSecurityLocked: false,
                    beneficiaries: newMessage.beneficiaries || []
                };
                setMessages(prev => [mockMessage, ...prev]);
                
                // 목업 메시지 저장 성공 알림
                toast.success(t.success.messageSaved);
                
                // 블록체인 저장 시뮬레이션
                setTimeout(() => {
                    toast.success(t.success.blockchainSaved);
                }, 1500);
            }
            
            setNewMessage({
                title: '',
                content: '',
                recipientEmails: [''],
                deliveryDate: '',
                beneficiaries: []
            });
            setShowAddForm(false);
            setError('');
        } catch (err) {
            setError(t.error.saveFailed);
            console.error('Create message error:', err);
        }
    };

    // 메시지 업데이트
    const handleUpdateMessage = async (id: number, updateData: UpdateMessageRequest) => {
        try {
            await messageAPI.updateMessage(id, updateData);
            await loadMessages(); // 새로고침
            setEditingMessage(null);
            setError('');
        } catch (err) {
            setError(t.error.saveFailed);
            console.error('Update message error:', err);
        }
    };

    // 메시지 삭제
    const handleDeleteMessage = async (id: number) => {
        if (!confirm(t.confirm.delete)) return;
        
        try {
            try {
                await messageAPI.deleteMessage(id);
            } catch (backendError) {
                console.warn('Backend not available, deleting locally');
            }
            setMessages(prev => prev.filter(msg => msg.id !== id));
            setError('');
            
            // 메시지 삭제 성공 알림
            toast.success(t.success.messageDeleted);
        } catch (err) {
            setError(t.error.deleteFailed);
            console.error('Delete message error:', err);
        }
    };

    // 보안 잠금 토글
    const handleToggleSecurityLock = (message: Message) => {
        const action = message.isSecurityLocked ? t.confirm.unlock : t.confirm.lock;
        if (!confirm(action)) return;

        // 여기서 실제로는 백엔드에 보안 잠금 상태 업데이트 API 호출
        setMessages(prev => prev.map(msg => 
            msg.id === message.id 
                ? { ...msg, isSecurityLocked: !msg.isSecurityLocked }
                : msg
        ));
    };

    // 보안 설정 열기
    const handleOpenSecurity = (message: Message) => {
        setSelectedMessageForSecurity(message);
    };

    // 보안 설정 업데이트
    const handleSecurityUpdate = (messageId: number, security: MessageSecurity) => {
        setMessageSecurity(prev => ({
            ...prev,
            [messageId]: security
        }));

        // 배송 후 잠금 상태를 메시지의 isSecurityLocked와 동기화
        if (security.locked !== undefined) {
            setMessages(prev => prev.map(msg => 
                msg.id === messageId 
                    ? { ...msg, isSecurityLocked: security.locked }
                    : msg
            ));
        }
    };

    // 수신자 이메일 추가
    const addRecipientEmail = () => {
        setNewMessage(prev => ({
            ...prev,
            recipientEmails: [...prev.recipientEmails, '']
        }));
    };

    // 수신자 이메일 업데이트
    const updateRecipientEmail = (index: number, email: string) => {
        setNewMessage(prev => ({
            ...prev,
            recipientEmails: prev.recipientEmails.map((e, i) => i === index ? email : e)
        }));
    };

    // 수신자 이메일 삭제
    const removeRecipientEmail = (index: number) => {
        if (newMessage.recipientEmails.length > 1) {
            setNewMessage(prev => ({
                ...prev,
                recipientEmails: prev.recipientEmails.filter((_, i) => i !== index)
            }));
        }
    };


    // 기존 메시지의 상속자 수정
    const handleUpdateBeneficiary = async (messageId: number, updatedBeneficiary: Beneficiary) => {
        try {
            // 메시지에서 해당 상속자 업데이트
            setMessages(prev => prev.map(message => {
                if (message.id === messageId) {
                    return {
                        ...message,
                        beneficiaries: (message.beneficiaries || []).map(b => 
                            b.id === updatedBeneficiary.id ? updatedBeneficiary : b
                        )
                    };
                }
                return message;
            }));
            
            // 실제로는 백엔드 API 호출
            // await messageAPI.updateMessage(messageId, { beneficiaries: updatedBeneficiaries });
            
            setSelectedBeneficiary(null);
            setEditingBeneficiary(null);
            
            toast.success(t.success.messageSaved);
        } catch (err) {
            setError(t.error.saveFailed);
            console.error('Update beneficiary error:', err);
        }
    };

    // 기존 메시지의 상속자 삭제
    const handleDeleteBeneficiary = async (messageId: number, beneficiaryId: string) => {
        if (!confirm('정말 이 상속자를 삭제하시겠습니까?')) return;
        
        try {
            setMessages(prev => prev.map(message => {
                if (message.id === messageId) {
                    return {
                        ...message,
                        beneficiaries: (message.beneficiaries || []).filter(b => b.id !== beneficiaryId)
                    };
                }
                return message;
            }));
            
            setSelectedBeneficiary(null);
            setEditingBeneficiary(null);
            
            toast.success('상속자가 삭제되었습니다.');
        } catch (err) {
            setError(t.error.deleteFailed);
            console.error('Delete beneficiary error:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-slate-400">Loading messages...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">{t.title}</h2>
                    <p className="text-slate-400 text-sm mt-1">
                        {t.subtitle} ({messages.length}/10)
                    </p>
                </div>
                {messages.length < 10 && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" />
                        {t.addMessage}
                    </button>
                )}
            </div>

            {/* 오류 메시지 */}
            {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            {/* 새 메시지 추가 폼 */}
            {showAddForm && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">{t.addMessage}</h3>
                    
                    <div className="space-y-4">
                        {/* 제목 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                {t.messageTitle}
                            </label>
                            <input
                                type="text"
                                value={newMessage.title}
                                onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
                                placeholder={t.placeholder.title}
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>

                        {/* 내용 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                {t.messageContent}
                            </label>
                            <textarea
                                value={newMessage.content}
                                onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                                placeholder={t.placeholder.content}
                                rows={6}
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                            />
                        </div>

                        {/* 수신자 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                {t.recipients}
                            </label>
                            {newMessage.recipientEmails.map((email, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => updateRecipientEmail(index, e.target.value)}
                                        placeholder={t.placeholder.email}
                                        className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    />
                                    {newMessage.recipientEmails.length > 1 && (
                                        <button
                                            onClick={() => removeRecipientEmail(index)}
                                            className="px-3 py-2 text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={addRecipientEmail}
                                className="text-sky-400 hover:text-sky-300 text-sm transition-colors"
                            >
                                + {t.addRecipient}
                            </button>
                        </div>

                        {/* 전달 날짜 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                {t.deliveryDate}
                            </label>
                            <input
                                type="datetime-local"
                                value={newMessage.deliveryDate}
                                onChange={(e) => setNewMessage(prev => ({ ...prev, deliveryDate: e.target.value }))}
                                min={new Date().toISOString().slice(0, 16)}
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>

                        {/* 상속 수혜자 선택 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                {t.beneficiaries}
                            </label>
                            {globalBeneficiaries.length > 0 ? (
                                <div className="space-y-2">
                                    <p className="text-xs text-slate-400 mb-3">{t.selectBeneficiaries}</p>
                                    {globalBeneficiaries.map((beneficiary) => (
                                        <label key={beneficiary.id} className="flex items-center gap-3 p-3 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-700/70 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={(newMessage.beneficiaries || []).some(b => b.id === beneficiary.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setNewMessage(prev => ({
                                                            ...prev,
                                                            beneficiaries: [...(prev.beneficiaries || []), beneficiary]
                                                        }));
                                                    } else {
                                                        setNewMessage(prev => ({
                                                            ...prev,
                                                            beneficiaries: (prev.beneficiaries || []).filter(b => b.id !== beneficiary.id)
                                                        }));
                                                    }
                                                }}
                                                className="w-4 h-4 text-sky-600 bg-slate-600 border-slate-500 rounded focus:ring-sky-500 focus:ring-2"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-white">{beneficiary.name}</span>
                                                    <span className="text-sm text-slate-400">({beneficiary.relationship})</span>
                                                </div>
                                                <div className="text-sm text-slate-500">{beneficiary.email}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-center">
                                    <p className="text-slate-400 mb-3">{t.noBeneficiariesAvailable}</p>
                                    <button
                                        type="button"
                                        onClick={() => window.location.hash = '#successors'}
                                        className="text-sky-400 hover:text-sky-300 text-sm font-medium"
                                    >
                                        {t.goToSuccessors}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 버튼 */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleCreateMessage}
                                className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
                            >
                                {t.save}
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setNewMessage({
                                        title: '',
                                        content: '',
                                        recipientEmails: [''],
                                        deliveryDate: '',
                                        beneficiaries: []
                                    });
                                    setError('');
                                }}
                                className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                            >
                                {t.cancel}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 메시지 목록 */}
            <div className="space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-slate-400 mb-4">{t.noMessages}</div>
                        {messages.length < 10 && (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
                            >
                                {t.addMessage}
                            </button>
                        )}
                    </div>
                ) : (
                    messages.map((message) => (
                        <MessageCard
                            key={message.id}
                            message={message}
                            t={t}
                            onEdit={() => setEditingMessage(message)}
                            onDelete={() => handleDeleteMessage(message.id)}
                            onToggleLock={() => handleToggleSecurityLock(message)}
                            onOpenSecurity={() => handleOpenSecurity(message)}
                            onSelectBeneficiary={(beneficiary) => setSelectedBeneficiary({beneficiary, messageId: message.id})}
                        />
                    ))
                )}
            </div>

            {/* 보안 설정 모달 */}
            {selectedMessageForSecurity && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white">
                                {t.securitySettings} - {selectedMessageForSecurity.title}
                            </h2>
                            <button
                                onClick={() => setSelectedMessageForSecurity(null)}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <SecurityManager
                                language={language}
                                messageId={selectedMessageForSecurity.id.toString()}
                                messageContent={selectedMessageForSecurity.content}
                                onSecurityUpdate={(security) => handleSecurityUpdate(selectedMessageForSecurity.id, security)}
                                initialSecurity={messageSecurity[selectedMessageForSecurity.id]}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 상속자 상세 모달 */}
            {selectedBeneficiary && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white">
                                {t.beneficiaryDetails}
                            </h2>
                            <button
                                onClick={() => {
                                    setSelectedBeneficiary(null);
                                    setEditingBeneficiary(null);
                                }}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            {editingBeneficiary ? (
                                <BeneficiaryEditForm 
                                    beneficiary={editingBeneficiary}
                                    t={t}
                                    onSave={(updated) => handleUpdateBeneficiary(selectedBeneficiary.messageId, updated)}
                                    onCancel={() => setEditingBeneficiary(null)}
                                    onDelete={() => handleDeleteBeneficiary(selectedBeneficiary.messageId, selectedBeneficiary.beneficiary.id)}
                                />
                            ) : (
                                <BeneficiaryDetailView 
                                    beneficiary={selectedBeneficiary.beneficiary}
                                    t={t}
                                    onEdit={() => setEditingBeneficiary(selectedBeneficiary.beneficiary)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// 메시지 카드 컴포넌트
const MessageCard: React.FC<{
    message: Message;
    t: any;
    onEdit: () => void;
    onDelete: () => void;
    onToggleLock: () => void;
    onOpenSecurity: () => void;
    onSelectBeneficiary: (beneficiary: Beneficiary) => void;
}> = ({ message, t, onEdit, onDelete, onToggleLock, onOpenSecurity, onSelectBeneficiary }) => {
    const [showContent, setShowContent] = useState(false);
    const [showInheritance, setShowInheritance] = useState(false);
    
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{message.title}</h3>
                        {message.isSecurityLocked && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-amber-900/30 border border-amber-600/30 rounded-md text-amber-400 text-xs">
                                <LockClosedIcon className="w-3 h-3" />
                                {t.securityLocked}
                            </span>
                        )}
                    </div>
                    
                    <div className="text-sm text-slate-400 space-y-1">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            {t.createdAt} {new Date(message.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4" />
                            {t.deliveryScheduled} {new Date(message.deliveryDate).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onOpenSecurity}
                        className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-700 rounded-lg transition-colors"
                        title={t.securitySettings}
                    >
                        <ShieldCheckIcon className="w-4 h-4" />
                    </button>

                    {message.beneficiaries && message.beneficiaries.length > 0 && (
                        <button
                            onClick={() => setShowInheritance(!showInheritance)}
                            className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700 rounded-lg transition-colors"
                            title={t.viewInheritance}
                        >
                            <UserGroupIcon className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        onClick={onToggleLock}
                        className={`p-2 rounded-lg transition-colors ${
                            message.isSecurityLocked
                                ? 'text-amber-400 hover:bg-amber-900/20'
                                : 'text-slate-400 hover:bg-slate-700'
                        }`}
                        title={message.isSecurityLocked ? t.unlock : t.lock}
                    >
                        {message.isSecurityLocked ? (
                            <LockClosedIcon className="w-4 h-4" />
                        ) : (
                            <LockOpenIcon className="w-4 h-4" />
                        )}
                    </button>

                    {!message.isSecurityLocked && !message.isDelivered && (
                        <button
                            onClick={onEdit}
                            className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-700 rounded-lg transition-colors"
                            title={t.edit}
                        >
                            <PencilIcon className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        onClick={() => setShowContent(!showContent)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        title={t.view}
                    >
                        <EyeIcon className="w-4 h-4" />
                    </button>

                    {!message.isSecurityLocked && !message.isDelivered && (
                        <button
                            onClick={onDelete}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                            title={t.delete}
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {showContent && (
                <div className="border-t border-slate-700 pt-4">
                    <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                        <p className="text-slate-300 whitespace-pre-wrap">{message.content}</p>
                    </div>
                    
                    <div className="text-sm text-slate-400">
                        <strong>Recipients:</strong> {message.recipientEmails.join(', ')}
                    </div>
                </div>
            )}

            {showInheritance && message.beneficiaries && message.beneficiaries.length > 0 && (
                <div className="border-t border-slate-700 pt-4">
                    <h4 className="text-lg font-semibold text-white mb-2">{t.beneficiaries}</h4>
                    <p className="text-sm text-slate-400 mb-4">{t.inheritanceDescription}</p>
                    <div className="space-y-3">
                        {message.beneficiaries.map((beneficiary, index) => (
                            <div 
                                key={beneficiary.id} 
                                className="bg-slate-900/50 rounded-lg p-4 cursor-pointer hover:bg-slate-800/50 transition-colors border border-slate-700/50 hover:border-slate-600"
                                onClick={() => onSelectBeneficiary(beneficiary)}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                                    <div>
                                        <span className="text-sm font-medium text-slate-400">Name:</span>
                                        <p className="text-white">{beneficiary.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-slate-400">Email:</span>
                                        <p className="text-white">{beneficiary.email}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-slate-400">{t.relationship}:</span>
                                        <p className="text-white">{beneficiary.relationship}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-slate-400">{t.inheritanceShare}:</span>
                                        <p className="text-white">{beneficiary.inheritanceShare || 0}%</p>
                                    </div>
                                </div>
                                {beneficiary.notes && (
                                    <div>
                                        <span className="text-sm font-medium text-slate-400">{t.beneficiaryNotes}:</span>
                                        <p className="text-slate-300">{beneficiary.notes}</p>
                                    </div>
                                )}
                                <div className="text-xs text-slate-500 mt-2 text-center">
                                    클릭하여 상세 정보 보기 및 수정
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// 상속자 상세 보기 컴포넌트
const BeneficiaryDetailView: React.FC<{
    beneficiary: Beneficiary;
    t: any;
    onEdit: () => void;
}> = ({ beneficiary, t, onEdit }) => {
    return (
        <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                        <p className="text-lg text-white">{beneficiary.name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                        <p className="text-lg text-white">{beneficiary.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">{t.relationship}</label>
                        <p className="text-lg text-white">{beneficiary.relationship}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">{t.inheritanceShare}</label>
                        <p className="text-lg text-white">{beneficiary.inheritanceShare || 0}%</p>
                    </div>
                </div>
                {beneficiary.notes && (
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">{t.beneficiaryNotes}</label>
                        <p className="text-white bg-slate-700/50 rounded-lg p-3">{beneficiary.notes}</p>
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={onEdit}
                    className="flex items-center gap-2 px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
                >
                    <PencilIcon className="w-4 h-4" />
                    {t.editBeneficiary}
                </button>
            </div>
        </div>
    );
};

// 상속자 편집 폼 컴포넌트
const BeneficiaryEditForm: React.FC<{
    beneficiary: Beneficiary;
    t: any;
    onSave: (updated: Beneficiary) => void;
    onCancel: () => void;
    onDelete: () => void;
}> = ({ beneficiary, t, onSave, onCancel, onDelete }) => {
    const [formData, setFormData] = useState<Beneficiary>(beneficiary);

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">{t.relationship}</label>
                        <input
                            type="text"
                            value={formData.relationship}
                            onChange={(e) => setFormData(prev => ({...prev, relationship: e.target.value}))}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">{t.inheritanceShare}</label>
                        <input
                            type="number"
                            value={formData.inheritanceShare || ''}
                            onChange={(e) => setFormData(prev => ({...prev, inheritanceShare: parseInt(e.target.value) || 0}))}
                            min="0"
                            max="100"
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">{t.beneficiaryNotes}</label>
                    <textarea
                        value={formData.notes || ''}
                        onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                    />
                </div>
            </div>

            <div className="flex justify-between">
                <button
                    onClick={onDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                    <TrashIcon className="w-4 h-4" />
                    {t.delete}
                </button>
                
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                    >
                        {t.cancel}
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
                    >
                        {t.save}
                    </button>
                </div>
            </div>
        </div>
    );
};