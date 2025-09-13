import React, { useState, useEffect } from 'react';
import type { Language } from '../App';

interface AdminProps {
    language: Language;
}

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

const Admin: React.FC<AdminProps> = ({ language }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'verifications' | 'blockchain' | 'settings'>('dashboard');
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [loginError, setLoginError] = useState('');
    
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

    const texts = {
        ko: {
            adminLogin: '관리자 로그인',
            username: '사용자명',
            password: '비밀번호',
            login: '로그인',
            logout: '로그아웃',
            dashboard: '대시보드',
            users: '사용자 관리',
            verifications: '검증 관리',
            blockchain: '블록체인',
            settings: '설정',
            welcomeAdmin: '관리자 패널에 오신 것을 환영합니다',
            totalUsers: '전체 사용자',
            activeUsers: '활성 사용자',
            inactiveUsers: '비활성 사용자',
            newUsersToday: '오늘 신규 가입',
            pendingVerifications: '대기 중인 검증',
            completedVerifications: '완료된 검증',
            failedVerifications: '실패한 검증',
            systemOverview: '시스템 현황',
            userActivity: '사용자 활동',
            verificationActivity: '검증 활동',
            invalidCredentials: '잘못된 로그인 정보입니다.'
        },
        en: {
            adminLogin: 'Admin Login',
            username: 'Username',
            password: 'Password',
            login: 'Login',
            logout: 'Logout',
            dashboard: 'Dashboard',
            users: 'Users',
            verifications: 'Verifications',
            blockchain: 'Blockchain',
            settings: 'Settings',
            welcomeAdmin: 'Welcome to Admin Panel',
            totalUsers: 'Total Users',
            activeUsers: 'Active Users',
            inactiveUsers: 'Inactive Users',
            newUsersToday: 'New Users Today',
            pendingVerifications: 'Pending Verifications',
            completedVerifications: 'Completed Verifications',
            failedVerifications: 'Failed Verifications',
            systemOverview: 'System Overview',
            userActivity: 'User Activity',
            verificationActivity: 'Verification Activity',
            invalidCredentials: 'Invalid credentials.'
        }
    };

    const t = texts[language];

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
            setLoginError(t.invalidCredentials);
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
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">{t.adminLogin}</h2>
                    
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t.username}
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
                                {t.password}
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
                            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                        >
                            {t.login}
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center text-sm text-gray-400">
                        Demo: admin / admin123
                    </div>
                </div>
            </div>
        );
    }

    const StatCard: React.FC<{ title: string; value: number; color: string }> = ({ title, value, color }) => (
        <div className="bg-slate-800 p-4 rounded-lg">
            <h3 className="text-gray-400 text-xs font-medium">{title}</h3>
            <p className={`text-xl font-bold ${color} mt-1`}>{value.toLocaleString()}</p>
        </div>
    );

    const renderDashboard = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">{t.welcomeAdmin}</h2>
                    <p className="text-gray-400 text-sm">관리자: {adminUser?.username}</p>
                </div>
                <div className="text-gray-400 text-sm">
                    {new Date().toLocaleDateString('ko-KR')}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                    <h3 className="text-md font-semibold text-white mb-3">{t.systemOverview}</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard title={t.totalUsers} value={userStats.totalUsers} color="text-blue-400" />
                        <StatCard title={t.activeUsers} value={userStats.activeUsers} color="text-green-400" />
                        <StatCard title={t.inactiveUsers} value={userStats.inactiveUsers} color="text-yellow-400" />
                        <StatCard title={t.newUsersToday} value={userStats.newUsersToday} color="text-purple-400" />
                    </div>
                </div>

                <div>
                    <h3 className="text-md font-semibold text-white mb-3">{t.verificationActivity}</h3>
                    <div className="grid grid-cols-1 gap-3">
                        <StatCard title={t.pendingVerifications} value={verificationStats.pendingVerifications} color="text-orange-400" />
                        <StatCard title={t.completedVerifications} value={verificationStats.completedVerifications} color="text-green-400" />
                        <StatCard title={t.failedVerifications} value={verificationStats.failedVerifications} color="text-red-400" />
                    </div>
                </div>
            </div>

            {/* 추가 정보 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">서버 상태</h4>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-green-400 text-sm">정상 운영</span>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">업타임: 99.9%</p>
                </div>
                
                <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">메시지 통계</h4>
                    <p className="text-blue-400 text-lg font-bold">2,847</p>
                    <p className="text-gray-400 text-xs">총 메시지 수</p>
                </div>
                
                <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">결제 통계</h4>
                    <p className="text-green-400 text-lg font-bold">₩1,247,000</p>
                    <p className="text-gray-400 text-xs">이번 달 수익</p>
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">{t.users}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg">
                    <h3 className="text-white font-medium mb-3">최근 가입 사용자</h3>
                    <div className="space-y-2">
                        {['user123@email.com', 'newuser@gmail.com', 'test@example.com'].map((email, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-gray-300">{email}</span>
                                <span className="text-gray-400">{new Date(Date.now() - i * 86400000).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                    <h3 className="text-white font-medium mb-3">사용자 관리</h3>
                    <div className="space-y-2">
                        <button className="w-full text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-gray-300 transition-colors">
                            전체 사용자 목록
                        </button>
                        <button className="w-full text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-gray-300 transition-colors">
                            비활성 사용자 관리
                        </button>
                        <button className="w-full text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-gray-300 transition-colors">
                            사용자 권한 관리
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderVerifications = () => (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">{t.verifications}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg">
                    <h3 className="text-white font-medium mb-3">대기 중인 검증</h3>
                    <div className="space-y-2">
                        {['법적 공증 검증 #1234', '블록체인 검증 #5678', '신원 확인 #9012'].map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-gray-300">{item}</span>
                                <button className="text-blue-400 hover:text-blue-300">처리</button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                    <h3 className="text-white font-medium mb-3">검증 통계</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">오늘 완료:</span>
                            <span className="text-green-400">23건</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">평균 처리 시간:</span>
                            <span className="text-blue-400">2.3시간</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">성공률:</span>
                            <span className="text-green-400">98.5%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderBlockchain = () => (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">{t.blockchain}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg">
                    <h3 className="text-white font-medium mb-3">블록체인 상태</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">최신 블록:</span>
                            <span className="text-blue-400">#847,293</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">네트워크 해시레이트:</span>
                            <span className="text-green-400">1.2 TH/s</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">평균 블록 시간:</span>
                            <span className="text-yellow-400">10.2분</span>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                    <h3 className="text-white font-medium mb-3">최근 트랜잭션</h3>
                    <div className="space-y-2">
                        {['0x1a2b...c3d4', '0x5e6f...g7h8', '0x9i0j...k1l2'].map((hash, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-gray-300 font-mono">{hash}</span>
                                <span className="text-green-400">✓</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">{t.settings}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg">
                    <h3 className="text-white font-medium mb-3">시스템 설정</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">유지보수 모드</span>
                            <button className="bg-slate-600 relative inline-flex h-6 w-11 items-center rounded-full">
                                <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">자동 백업</span>
                            <button className="bg-blue-600 relative inline-flex h-6 w-11 items-center rounded-full">
                                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">보안 로깅</span>
                            <button className="bg-blue-600 relative inline-flex h-6 w-11 items-center rounded-full">
                                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                    <h3 className="text-white font-medium mb-3">알림 설정</h3>
                    <div className="space-y-2">
                        <button className="w-full text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-gray-300 transition-colors">
                            이메일 알림 설정
                        </button>
                        <button className="w-full text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-gray-300 transition-colors">
                            시스템 경고 설정
                        </button>
                        <button className="w-full text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-gray-300 transition-colors">
                            백업 알림 설정
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Admin Header */}
            <header className="bg-slate-800 border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-12">
                        <h1 className="text-lg font-bold text-white">FinalMessage Admin</h1>
                        <div className="flex items-center gap-3">
                            <span className="text-gray-400 text-sm">관리자: {adminUser?.username}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                            >
                                {t.logout}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <nav className="w-48 bg-slate-800 min-h-screen border-r border-slate-700">
                    <div className="p-3">
                        <div className="space-y-1">
                            {[
                                { id: 'dashboard', label: t.dashboard },
                                { id: 'users', label: t.users },
                                { id: 'verifications', label: t.verifications },
                                { id: 'blockchain', label: t.blockchain },
                                { id: 'settings', label: t.settings }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full text-left px-3 py-2 rounded text-sm font-medium transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-sky-600 text-white'
                                            : 'text-gray-400 hover:bg-slate-700 hover:text-white'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="flex-1 p-4 overflow-y-auto" style={{ height: 'calc(100vh - 3rem)' }}>
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'users' && renderUsers()}
                    {activeTab === 'verifications' && renderVerifications()}
                    {activeTab === 'blockchain' && renderBlockchain()}
                    {activeTab === 'settings' && renderSettings()}
                </main>
            </div>
        </div>
    );
};

export default Admin;