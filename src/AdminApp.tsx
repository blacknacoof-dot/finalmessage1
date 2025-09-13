import React, { useState, useEffect } from 'react';
import { NotificationSystem } from '../components/NotificationSystem';

interface AdminUser {
    id: string;
    username: string;
    role: 'super_admin' | 'admin';
    lastLogin?: string;
}

interface UserStats {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    newUsersToday: number;
}

interface VerificationStats {
    pendingVerifications: number;
    completedVerifications: number;
    failedVerifications: number;
}

interface FinalMessageUser {
    id: string;
    name: string;
    email: string;
    plan: 'Free' | 'Premium' | 'Pro';
    joinDate: string;
    lastActivity: string;
    status: 'active' | 'inactive' | 'suspended';
    messagesCount: number;
    verifiersCount: number;
}

interface VerificationProcess {
    id: string;
    userId: string;
    userName: string;
    startDate: string;
    status: 'pending' | 'completed' | 'failed';
    verifiersTotal: number;
    verifiersCompleted: number;
    messageHash: string;
}

const AdminApp: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'verifications' | 'blockchain' | 'settings'>('dashboard');
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [loginError, setLoginError] = useState('');
    
    // Additional state for UI components
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
    const [selectedUser, setSelectedUser] = useState<FinalMessageUser | null>(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [verificationFilterStatus, setVerificationFilterStatus] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
    const [selectedProcess, setSelectedProcess] = useState<VerificationProcess | null>(null);
    const [showProcessModal, setShowProcessModal] = useState(false);
    
    // Settings state
    const [emailSettings, setEmailSettings] = useState({
        smtpServer: 'smtp.sendgrid.net',
        smtpPort: '587',
        senderEmail: 'noreply@finalmessage.com',
        apiKey: '••••••••••••••••'
    });

    const [smsSettings, setSmsSettings] = useState({
        provider: 'twilio',
        accountSid: '••••••••••••••••',
        authToken: '••••••••••••••••',
        fromNumber: '+1234567890'
    });

    const [blockchainSettings, setBlockchainSettings] = useState({
        network: 'polygon-amoy',
        rpcUrl: 'https://rpc-amoy.polygon.technology/',
        contractAddress: '0x1234567890123456789012345678901234567890',
        gasLimit: '100000',
        gasPrice: 'auto'
    });

    const [systemSettings, setSystemSettings] = useState({
        defaultInactivityPeriod: '365',
        maxVerifiers: '10',
        verificationTimeout: '7',
        enableEmailNotifications: true,
        enableSmsNotifications: false,
        enableBlockchainStorage: true,
        maintenanceMode: false
    });
    
    // Mock data
    const [userStats] = useState<UserStats>({
        totalUsers: 1247,
        activeUsers: 892,
        inactiveUsers: 355,
        newUsersToday: 23
    });
    
    const [verificationStats] = useState<VerificationStats>({
        pendingVerifications: 45,
        completedVerifications: 1203,
        failedVerifications: 12
    });

    // Real user data from backend API
    const [users, setUsers] = useState<FinalMessageUser[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);

    // Fetch users from backend
    useEffect(() => {
        if (isAuthenticated) {
            setIsLoadingUsers(true);
            fetch('http://localhost:3003/api/auth/users')
                .then(response => response.json())
                .then(data => {
                    if (data.success && Array.isArray(data.users)) {
                        const formattedUsers = data.users.map((user: any) => ({
                            id: user.id.toString(),
                            name: user.name || 'Unknown',
                            email: user.email,
                            plan: 'Free' as const, // Default plan
                            joinDate: new Date(user.created_at || Date.now()).toISOString().split('T')[0],
                            lastActivity: new Date(user.created_at || Date.now()).toISOString().split('T')[0],
                            status: 'active' as const,
                            messagesCount: 0,
                            verifiersCount: 0
                        }));
                        setUsers(formattedUsers);
                    }
                })
                .catch(error => {
                    console.error('Failed to fetch users:', error);
                    // Fallback to mock data
                    setUsers([
                        {
                            id: 'user_1',
                            name: 'John Doe',
                            email: 'john@example.com',
                            plan: 'Premium',
                            joinDate: '2024-01-15',
                            lastActivity: '2024-01-20',
                            status: 'active',
                            messagesCount: 3,
                            verifiersCount: 5
                        },
                        {
                            id: 'user_2',
                            name: 'Jane Smith',
                            email: 'jane@example.com',
                            plan: 'Free',
                            joinDate: '2024-01-10',
                            lastActivity: '2023-12-15',
                            status: 'inactive',
                            messagesCount: 1,
                            verifiersCount: 2
                        },
                        {
                            id: 'user_3',
                            name: 'Black Kim',
                            email: 'black@example.com',
                            plan: 'Free',
                            joinDate: '2024-01-08',
                            lastActivity: '2024-01-21',
                            status: 'active',
                            messagesCount: 2,
                            verifiersCount: 3
                        }
                    ]);
                })
                .finally(() => {
                    setIsLoadingUsers(false);
                });
        }
    }, [isAuthenticated]);

    // Mock verification processes
    const [verificationProcesses] = useState<VerificationProcess[]>([
        {
            id: 'vp_1',
            userId: 'user_2',
            userName: 'Jane Smith',
            startDate: '2024-01-16',
            status: 'pending',
            verifiersTotal: 2,
            verifiersCompleted: 1,
            messageHash: '0x1234...abcd'
        },
        {
            id: 'vp_2',
            userId: 'user_4',
            userName: 'Mike Johnson',
            startDate: '2024-01-15',
            status: 'completed',
            verifiersTotal: 3,
            verifiersCompleted: 3,
            messageHash: '0x5678...efgh'
        }
    ]);

    // Check for existing admin session
    useEffect(() => {
        const savedAdmin = localStorage.getItem('finalmessage_admin');
        if (savedAdmin) {
            try {
                const admin = JSON.parse(savedAdmin);
                setAdminUser(admin);
                setIsAuthenticated(true);
            } catch (error) {
                localStorage.removeItem('finalmessage_admin');
            }
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');

        // Mock admin authentication
        if (loginForm.username === 'admin' && loginForm.password === 'admin123') {
            const admin: AdminUser = {
                id: 'admin_1',
                username: 'admin',
                role: 'super_admin',
                lastLogin: new Date().toISOString()
            };
            
            setAdminUser(admin);
            setIsAuthenticated(true);
            localStorage.setItem('finalmessage_admin', JSON.stringify(admin));
            setLoginForm({ username: '', password: '' });
        } else {
            setLoginError('잘못된 로그인 정보입니다.');
        }
    };

    const handleLogout = () => {
        setAdminUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('finalmessage_admin');
        setActiveTab('dashboard');
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 text-gray-200 antialiased flex items-center justify-center">
                <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-white mb-2">FinalMessage</h1>
                        <h2 className="text-xl font-semibold text-gray-300">관리자 로그인</h2>
                    </div>
                    
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                사용자명
                            </label>
                            <input
                                type="text"
                                value={loginForm.username}
                                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                비밀번호
                            </label>
                            <input
                                type="password"
                                value={loginForm.password}
                                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                required
                            />
                        </div>
                        
                        {loginError && (
                            <div className="text-red-400 text-sm">{loginError}</div>
                        )}
                        
                        <button
                            type="submit"
                            className="w-full admin-primary-btn text-white font-medium py-2 px-4 rounded-md transition-colors"
                        >
                            로그인
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center text-sm text-gray-400">
                        Demo: admin / admin123
                    </div>
                </div>
                <NotificationSystem />
            </div>
        );
    }

    const StatCard: React.FC<{ title: string; value: number; color: string; subtitle?: string }> = ({ title, value, color, subtitle }) => (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
            <p className={`text-3xl font-bold ${color} mt-2`}>{value.toLocaleString()}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
    );

    const renderDashboard = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">관리자 대시보드</h2>
                <p className="text-gray-400">관리자: {adminUser?.username} | 마지막 로그인: {new Date().toLocaleString()}</p>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-white mb-4">시스템 현황</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="전체 사용자" value={userStats.totalUsers} color="text-blue-400" />
                    <StatCard title="활성 사용자" value={userStats.activeUsers} color="text-green-400" />
                    <StatCard title="비활성 사용자" value={userStats.inactiveUsers} color="text-yellow-400" />
                    <StatCard title="오늘 신규 가입" value={userStats.newUsersToday} color="text-purple-400" />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-white mb-4">검증 활동</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard title="대기 중인 검증" value={verificationStats.pendingVerifications} color="text-orange-400" subtitle="처리 필요" />
                    <StatCard title="완료된 검증" value={verificationStats.completedVerifications} color="text-green-400" subtitle="성공적으로 처리됨" />
                    <StatCard title="실패한 검증" value={verificationStats.failedVerifications} color="text-red-400" subtitle="검토 필요" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4">최근 가입 사용자</h3>
                    <div className="space-y-3">
                        {users.slice(0, 3).map(user => (
                            <div key={user.id} className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium">{user.name}</p>
                                    <p className="text-gray-400 text-sm">{user.email}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    user.status === 'active' ? 'bg-green-900 text-green-200' :
                                    user.status === 'inactive' ? 'bg-yellow-900 text-yellow-200' :
                                    'bg-red-900 text-red-200'
                                }`}>
                                    {user.status === 'active' ? '활성' : user.status === 'inactive' ? '비활성' : '정지'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4">최근 검증 프로세스</h3>
                    <div className="space-y-3">
                        {verificationProcesses.slice(0, 3).map(process => (
                            <div key={process.id} className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium">{process.userName}</p>
                                    <p className="text-gray-400 text-sm">{process.verifiersCompleted}/{process.verifiersTotal} 검증 완료</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    process.status === 'completed' ? 'bg-green-900 text-green-200' :
                                    process.status === 'pending' ? 'bg-yellow-900 text-yellow-200' :
                                    'bg-red-900 text-red-200'
                                }`}>
                                    {process.status === 'completed' ? '완료' : process.status === 'pending' ? '진행중' : '실패'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUsers = () => {

        const filteredUsers = users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
            return matchesSearch && matchesStatus;
        });

        const handleViewUser = (user: FinalMessageUser) => {
            setSelectedUser(user);
            setShowUserModal(true);
        };

        const handleSuspendUser = (userId: string) => {
            if (confirm('정말로 이 사용자를 정지하시겠습니까?')) {
                // 실제로는 API 호출
                console.log('사용자 정지:', userId);
            }
        };

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">사용자 관리</h2>
                    <div className="flex gap-2">
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                            <option value="all">전체 상태</option>
                            <option value="active">활성</option>
                            <option value="inactive">비활성</option>
                            <option value="suspended">정지</option>
                        </select>
                        <input 
                            type="text" 
                            placeholder="사용자 검색..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard title="전체 사용자" value={users.length} color="text-blue-400" />
                    <StatCard title="활성 사용자" value={users.filter(u => u.status === 'active').length} color="text-green-400" />
                    <StatCard title="비활성 사용자" value={users.filter(u => u.status === 'inactive').length} color="text-yellow-400" />
                    <StatCard title="정지된 사용자" value={users.filter(u => u.status === 'suspended').length} color="text-red-400" />
                </div>

                <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">사용자</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">플랜</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">가입일</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">마지막 활동</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">상태</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">메시지/검증자</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">작업</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-750">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center mr-3">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{user.name}</p>
                                                    <p className="text-gray-400 text-sm">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                user.plan === 'Premium' ? 'bg-purple-900 text-purple-200' :
                                                user.plan === 'Pro' ? 'bg-blue-900 text-blue-200' :
                                                'bg-gray-900 text-gray-200'
                                            }`}>
                                                {user.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                            {new Date(user.joinDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                            {new Date(user.lastActivity).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                user.status === 'active' ? 'bg-green-900 text-green-200' :
                                                user.status === 'inactive' ? 'bg-yellow-900 text-yellow-200' :
                                                'bg-red-900 text-red-200'
                                            }`}>
                                                {user.status === 'active' ? '활성' : user.status === 'inactive' ? '비활성' : '정지'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs">
                                                    📝 {user.messagesCount}
                                                </span>
                                                <span className="bg-green-900 text-green-200 px-2 py-1 rounded text-xs">
                                                    👥 {user.verifiersCount}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button 
                                                onClick={() => handleViewUser(user)}
                                                className="text-sky-400 hover:text-sky-300 mr-3"
                                            >
                                                상세보기
                                            </button>
                                            {user.status !== 'suspended' && (
                                                <button 
                                                    onClick={() => handleSuspendUser(user.id)}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    정지
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* User Detail Modal */}
                {showUserModal && selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-slate-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white">사용자 상세 정보</h3>
                                <button 
                                    onClick={() => setShowUserModal(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-400">이름</p>
                                    <p className="text-white">{selectedUser.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">이메일</p>
                                    <p className="text-white">{selectedUser.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">플랜</p>
                                    <p className="text-white">{selectedUser.plan}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">상태</p>
                                    <p className="text-white">{selectedUser.status}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">가입일</p>
                                    <p className="text-white">{new Date(selectedUser.joinDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">마지막 활동</p>
                                    <p className="text-white">{new Date(selectedUser.lastActivity).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">저장된 메시지</p>
                                    <p className="text-white">{selectedUser.messagesCount}개</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">등록된 검증자</p>
                                    <p className="text-white">{selectedUser.verifiersCount}명</p>
                                </div>
                            </div>
                            <div className="mt-6 flex gap-2">
                                <button className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded">
                                    메시지 보기
                                </button>
                                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
                                    검증자 보기
                                </button>
                                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded ml-auto">
                                    사용자 정지
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderVerifications = () => {
        const filteredProcesses = verificationProcesses.filter(process => {
            return verificationFilterStatus === 'all' || process.status === verificationFilterStatus;
        });

        const handleViewProcess = (process: VerificationProcess) => {
            setSelectedProcess(process);
            setShowProcessModal(true);
        };

        const handleForceComplete = (processId: string) => {
            if (confirm('정말로 이 검증 프로세스를 강제 완료하시겠습니까?')) {
                console.log('강제 완료:', processId);
            }
        };

        const mockVerifiers = [
            { id: 'v1', name: '김검증자', email: 'verifier1@example.com', status: 'completed', verifiedAt: '2024-01-17' },
            { id: 'v2', name: '박검증자', email: 'verifier2@example.com', status: 'pending', verifiedAt: null }
        ];

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">검증 상태 관리</h2>
                    <select 
                        value={verificationFilterStatus}
                        onChange={(e) => setVerificationFilterStatus(e.target.value as any)}
                        className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                        <option value="all">전체 상태</option>
                        <option value="pending">진행중</option>
                        <option value="completed">완료</option>
                        <option value="failed">실패</option>
                    </select>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard 
                        title="대기 중인 검증" 
                        value={verificationProcesses.filter(p => p.status === 'pending').length} 
                        color="text-orange-400" 
                        subtitle="즉시 처리 필요" 
                    />
                    <StatCard 
                        title="완료된 검증" 
                        value={verificationProcesses.filter(p => p.status === 'completed').length} 
                        color="text-green-400" 
                        subtitle="메시지 배포 완료" 
                    />
                    <StatCard 
                        title="실패한 검증" 
                        value={verificationProcesses.filter(p => p.status === 'failed').length} 
                        color="text-red-400" 
                        subtitle="문제 해결 필요" 
                    />
                </div>

                <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">사용자</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">시작일</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">진행률</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">상태</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">메시지 해시</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">작업</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {filteredProcesses.map(process => (
                                    <tr key={process.id} className="hover:bg-slate-750">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center mr-3">
                                                    {process.userName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{process.userName}</p>
                                                    <p className="text-gray-400 text-sm">ID: {process.userId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                            <div>
                                                <p>{new Date(process.startDate).toLocaleDateString()}</p>
                                                <p className="text-xs text-gray-500">{new Date(process.startDate).toLocaleTimeString()}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-1 bg-gray-700 rounded-full h-2 mr-2 min-w-20">
                                                    <div 
                                                        className={`h-2 rounded-full ${
                                                            process.status === 'completed' ? 'bg-green-500' :
                                                            process.status === 'failed' ? 'bg-red-500' :
                                                            'bg-sky-500'
                                                        }`}
                                                        style={{ width: `${(process.verifiersCompleted / process.verifiersTotal) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-gray-300 text-sm">
                                                    {process.verifiersCompleted}/{process.verifiersTotal}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    process.status === 'completed' ? 'bg-green-900 text-green-200' :
                                                    process.status === 'pending' ? 'bg-yellow-900 text-yellow-200' :
                                                    'bg-red-900 text-red-200'
                                                }`}>
                                                    {process.status === 'completed' ? '✅ 완료' : process.status === 'pending' ? '⏳ 진행중' : '❌ 실패'}
                                                </span>
                                                {process.status === 'pending' && (
                                                    <span className="text-xs text-orange-400">처리 필요</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <p className="text-gray-300 font-mono text-sm">{process.messageHash}</p>
                                                <button className="text-xs text-sky-400 hover:text-sky-300">해시 검증</button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button 
                                                onClick={() => handleViewProcess(process)}
                                                className="text-sky-400 hover:text-sky-300 mr-3"
                                            >
                                                상세보기
                                            </button>
                                            {process.status === 'pending' && (
                                                <button 
                                                    onClick={() => handleForceComplete(process.id)}
                                                    className="text-orange-400 hover:text-orange-300"
                                                >
                                                    강제완료
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Process Detail Modal */}
                {showProcessModal && selectedProcess && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-slate-800 p-6 rounded-lg max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white">검증 프로세스 상세</h3>
                                <button 
                                    onClick={() => setShowProcessModal(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Process Info */}
                                <div>
                                    <h4 className="text-lg font-semibold text-white mb-3">프로세스 정보</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="text-gray-400">사용자</p>
                                                <p className="text-white">{selectedProcess.userName}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">시작일</p>
                                                <p className="text-white">{new Date(selectedProcess.startDate).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">상태</p>
                                                <p className="text-white">{selectedProcess.status}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">진행률</p>
                                                <p className="text-white">{selectedProcess.verifiersCompleted}/{selectedProcess.verifiersTotal}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">메시지 해시</p>
                                            <p className="text-white font-mono break-all">{selectedProcess.messageHash}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Verifiers Info */}
                                <div>
                                    <h4 className="text-lg font-semibold text-white mb-3">검증자 상태</h4>
                                    <div className="space-y-2">
                                        {mockVerifiers.map(verifier => (
                                            <div key={verifier.id} className="bg-slate-700 p-3 rounded flex justify-between items-center">
                                                <div>
                                                    <p className="text-white font-medium">{verifier.name}</p>
                                                    <p className="text-gray-400 text-sm">{verifier.email}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        verifier.status === 'completed' ? 'bg-green-900 text-green-200' :
                                                        'bg-yellow-900 text-yellow-200'
                                                    }`}>
                                                        {verifier.status === 'completed' ? '완료' : '대기'}
                                                    </span>
                                                    {verifier.verifiedAt && (
                                                        <p className="text-gray-400 text-xs mt-1">{new Date(verifier.verifiedAt).toLocaleDateString()}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-2">
                                <button className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded">
                                    메시지 내용 보기
                                </button>
                                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
                                    블록체인 확인
                                </button>
                                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                                    검증자에게 알림
                                </button>
                                {selectedProcess.status === 'pending' && (
                                    <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded ml-auto">
                                        강제 완료
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderBlockchain = () => {
        // Mock blockchain data
        const blockchainStats = {
            totalTransactions: 2847,
            pendingTransactions: 12,
            failedTransactions: 8,
            avgGasPrice: '0.000025 MATIC',
            networkStatus: 'healthy'
        };

        const mockTransactions = [
            {
                id: 'tx_1',
                hash: '0x1234567890abcdef1234567890abcdef12345678',
                user: 'John Doe',
                type: 'store_hash',
                amount: '0.001 MATIC',
                gasUsed: '42,000',
                status: 'confirmed',
                blockNumber: 12345678,
                timestamp: '2024-01-21 14:30:25'
            },
            {
                id: 'tx_2', 
                hash: '0xabcdef1234567890abcdef1234567890abcdef12',
                user: 'Jane Smith',
                type: 'verify_message',
                amount: '0.0008 MATIC',
                gasUsed: '35,000',
                status: 'pending',
                blockNumber: null,
                timestamp: '2024-01-21 14:28:15'
            },
            {
                id: 'tx_3',
                hash: '0x567890abcdef1234567890abcdef1234567890ab',
                user: 'Black Kim',
                type: 'update_activity',
                amount: '0.0005 MATIC',
                gasUsed: '28,000',
                status: 'failed',
                blockNumber: null,
                timestamp: '2024-01-21 14:25:10'
            }
        ];

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">블록체인 모니터링</h2>
                    <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                            blockchainStats.networkStatus === 'healthy' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                        }`}>
                            🟢 네트워크 {blockchainStats.networkStatus === 'healthy' ? '정상' : '이상'}
                        </span>
                        <button className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md text-sm">
                            새로고침
                        </button>
                    </div>
                </div>

                {/* Blockchain Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <StatCard title="전체 트랜잭션" value={blockchainStats.totalTransactions} color="text-blue-400" />
                    <StatCard title="대기 중" value={blockchainStats.pendingTransactions} color="text-yellow-400" subtitle="처리 중" />
                    <StatCard title="실패" value={blockchainStats.failedTransactions} color="text-red-400" subtitle="재시도 필요" />
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-gray-400 text-sm font-medium">평균 가스비</h3>
                        <p className="text-2xl font-bold text-purple-400 mt-1">{blockchainStats.avgGasPrice}</p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-gray-400 text-sm font-medium">네트워크</h3>
                        <p className="text-lg font-bold text-green-400 mt-1">Polygon Amoy</p>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-700">
                        <h3 className="text-lg font-semibold text-white">최근 트랜잭션</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">트랜잭션 해시</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">사용자</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">타입</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">금액</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">가스</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">상태</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">블록</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">시간</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">액션</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {mockTransactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-slate-750">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <p className="text-white font-mono text-sm">{tx.hash.substring(0, 20)}...</p>
                                                <button className="text-xs text-sky-400 hover:text-sky-300">복사</button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-white">
                                            {tx.user}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                tx.type === 'store_hash' ? 'bg-blue-900 text-blue-200' :
                                                tx.type === 'verify_message' ? 'bg-green-900 text-green-200' :
                                                'bg-purple-900 text-purple-200'
                                            }`}>
                                                {tx.type === 'store_hash' ? '해시저장' : 
                                                 tx.type === 'verify_message' ? '메시지검증' : '활동업데이트'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                            {tx.amount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                            {tx.gasUsed}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                tx.status === 'confirmed' ? 'bg-green-900 text-green-200' :
                                                tx.status === 'pending' ? 'bg-yellow-900 text-yellow-200' :
                                                'bg-red-900 text-red-200'
                                            }`}>
                                                {tx.status === 'confirmed' ? '✅ 확인됨' :
                                                 tx.status === 'pending' ? '⏳ 대기중' : '❌ 실패'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                            {tx.blockNumber ? `#${tx.blockNumber.toLocaleString()}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                                            {tx.timestamp}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button className="text-sky-400 hover:text-sky-300 mr-3">상세보기</button>
                                            {tx.status === 'failed' && (
                                                <button className="text-orange-400 hover:text-orange-300">재시도</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Network Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-4">네트워크 정보</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">네트워크</span>
                                <span className="text-white">Polygon Amoy Testnet</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Chain ID</span>
                                <span className="text-white">80002</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">RPC URL</span>
                                <span className="text-white font-mono text-xs">rpc-amoy.polygon.technology</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Block Explorer</span>
                                <a href="https://amoy.polygonscan.com/" target="_blank" className="text-sky-400 hover:text-sky-300">
                                    amoy.polygonscan.com
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-4">스마트 컨트랙트</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-start">
                                <span className="text-gray-400">컨트랙트 주소</span>
                                <div className="text-right">
                                    <span className="text-white font-mono text-xs">0x1234...7890</span>
                                    <button className="ml-2 text-sky-400 hover:text-sky-300 text-xs">복사</button>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">배포 블록</span>
                                <span className="text-white">#12,234,567</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">컨트랙트 상태</span>
                                <span className="text-green-400">🟢 정상</span>
                            </div>
                            <div className="pt-2">
                                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm">
                                    컨트랙트 검증하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderSettings = () => {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">시스템 설정</h2>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
                        변경사항 저장
                    </button>
                </div>

                {/* General Settings */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">일반 설정</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                기본 비활성 기간 (일)
                            </label>
                            <input
                                type="number"
                                value={systemSettings.defaultInactivityPeriod}
                                onChange={(e) => setSystemSettings(prev => ({ ...prev, defaultInactivityPeriod: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                최대 검증자 수
                            </label>
                            <input
                                type="number"
                                value={systemSettings.maxVerifiers}
                                onChange={(e) => setSystemSettings(prev => ({ ...prev, maxVerifiers: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                검증 타임아웃 (일)
                            </label>
                            <input
                                type="number"
                                value={systemSettings.verificationTimeout}
                                onChange={(e) => setSystemSettings(prev => ({ ...prev, verificationTimeout: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="maintenanceMode"
                                checked={systemSettings.maintenanceMode}
                                onChange={(e) => setSystemSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                            />
                            <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-300">
                                유지보수 모드 활성화
                            </label>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">알림 설정</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-white font-medium">이메일 알림</h4>
                                <p className="text-gray-400 text-sm">검증자에게 이메일로 알림 전송</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={systemSettings.enableEmailNotifications}
                                onChange={(e) => setSystemSettings(prev => ({ ...prev, enableEmailNotifications: e.target.checked }))}
                                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-white font-medium">SMS 알림</h4>
                                <p className="text-gray-400 text-sm">검증자에게 SMS로 알림 전송</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={systemSettings.enableSmsNotifications}
                                onChange={(e) => setSystemSettings(prev => ({ ...prev, enableSmsNotifications: e.target.checked }))}
                                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-white font-medium">블록체인 저장</h4>
                                <p className="text-gray-400 text-sm">메시지 해시를 블록체인에 저장</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={systemSettings.enableBlockchainStorage}
                                onChange={(e) => setSystemSettings(prev => ({ ...prev, enableBlockchainStorage: e.target.checked }))}
                                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                            />
                        </div>
                    </div>
                </div>

                {/* Email Configuration */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">이메일 설정</h3>
                        <button className="text-sky-400 hover:text-sky-300 text-sm">테스트 발송</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                SMTP 서버
                            </label>
                            <input
                                type="text"
                                value={emailSettings.smtpServer}
                                onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpServer: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                SMTP 포트
                            </label>
                            <input
                                type="text"
                                value={emailSettings.smtpPort}
                                onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                발신자 이메일
                            </label>
                            <input
                                type="email"
                                value={emailSettings.senderEmail}
                                onChange={(e) => setEmailSettings(prev => ({ ...prev, senderEmail: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                API 키
                            </label>
                            <input
                                type="password"
                                value={emailSettings.apiKey}
                                onChange={(e) => setEmailSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                    </div>
                </div>

                {/* SMS Configuration */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">SMS 설정</h3>
                        <button className="text-sky-400 hover:text-sky-300 text-sm">테스트 발송</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                SMS 제공업체
                            </label>
                            <select
                                value={smsSettings.provider}
                                onChange={(e) => setSmsSettings(prev => ({ ...prev, provider: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                            >
                                <option value="twilio">Twilio</option>
                                <option value="aws-sns">AWS SNS</option>
                                <option value="nexmo">Nexmo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                발신 번호
                            </label>
                            <input
                                type="text"
                                value={smsSettings.fromNumber}
                                onChange={(e) => setSmsSettings(prev => ({ ...prev, fromNumber: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Account SID
                            </label>
                            <input
                                type="password"
                                value={smsSettings.accountSid}
                                onChange={(e) => setSmsSettings(prev => ({ ...prev, accountSid: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Auth Token
                            </label>
                            <input
                                type="password"
                                value={smsSettings.authToken}
                                onChange={(e) => setSmsSettings(prev => ({ ...prev, authToken: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Blockchain Configuration */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">블록체인 설정</h3>
                        <button className="text-sky-400 hover:text-sky-300 text-sm">연결 테스트</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                네트워크
                            </label>
                            <select
                                value={blockchainSettings.network}
                                onChange={(e) => setBlockchainSettings(prev => ({ ...prev, network: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                            >
                                <option value="polygon-amoy">Polygon Amoy Testnet</option>
                                <option value="polygon-mainnet">Polygon Mainnet</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                RPC URL
                            </label>
                            <input
                                type="text"
                                value={blockchainSettings.rpcUrl}
                                onChange={(e) => setBlockchainSettings(prev => ({ ...prev, rpcUrl: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                스마트 컨트랙트 주소
                            </label>
                            <input
                                type="text"
                                value={blockchainSettings.contractAddress}
                                onChange={(e) => setBlockchainSettings(prev => ({ ...prev, contractAddress: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Gas Limit
                            </label>
                            <input
                                type="text"
                                value={blockchainSettings.gasLimit}
                                onChange={(e) => setBlockchainSettings(prev => ({ ...prev, gasLimit: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Gas Price
                            </label>
                            <select
                                value={blockchainSettings.gasPrice}
                                onChange={(e) => setBlockchainSettings(prev => ({ ...prev, gasPrice: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                            >
                                <option value="auto">자동</option>
                                <option value="fast">빠름</option>
                                <option value="standard">표준</option>
                                <option value="slow">느림</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">시스템 상태</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl text-green-400 mb-2">🟢</div>
                            <div className="text-white font-medium">데이터베이스</div>
                            <div className="text-green-400 text-sm">정상</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl text-green-400 mb-2">🟢</div>
                            <div className="text-white font-medium">이메일 서비스</div>
                            <div className="text-green-400 text-sm">정상</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl text-yellow-400 mb-2">🟡</div>
                            <div className="text-white font-medium">SMS 서비스</div>
                            <div className="text-yellow-400 text-sm">비활성화됨</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl text-green-400 mb-2">🟢</div>
                            <div className="text-white font-medium">블록체인 연결</div>
                            <div className="text-green-400 text-sm">정상</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl text-green-400 mb-2">🟢</div>
                            <div className="text-white font-medium">스토리지</div>
                            <div className="text-green-400 text-sm">75% 사용중</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl text-green-400 mb-2">🟢</div>
                            <div className="text-white font-medium">CPU/메모리</div>
                            <div className="text-green-400 text-sm">정상</div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md">
                        모든 변경사항 저장
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md">
                        기본값으로 복원
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md ml-auto">
                        시스템 재시작
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-900 text-gray-200 antialiased">
            {/* Admin Header */}
            <header className="bg-slate-800 border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-bold text-white">FinalMessage</h1>
                            <span className="text-sky-400 text-sm font-medium">Admin Panel</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="admin-danger-btn text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            로그아웃
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <nav className="w-64 bg-slate-800 min-h-screen border-r border-slate-700">
                    <div className="p-4">
                        <div className="space-y-2">
                            {[
                                { id: 'dashboard', label: '대시보드', icon: '📊' },
                                { id: 'users', label: '사용자 관리', icon: '👥' },
                                { id: 'verifications', label: '검증 관리', icon: '✅' },
                                { id: 'blockchain', label: '블록체인', icon: '⛓️' },
                                { id: 'settings', label: '설정', icon: '⚙️' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full text-left px-4 py-3 rounded-md font-medium transition-colors flex items-center gap-3 ${
                                        activeTab === tab.id
                                            ? 'bg-sky-600 text-white'
                                            : 'text-gray-400 hover:bg-slate-700 hover:text-white'
                                    }`}
                                >
                                    <span>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'users' && renderUsers()}
                    {activeTab === 'verifications' && renderVerifications()}
                    {activeTab === 'blockchain' && renderBlockchain()}
                    {activeTab === 'settings' && renderSettings()}
                </main>
            </div>
            
            <NotificationSystem />
        </div>
    );
};

export default AdminApp;