import React, { useState } from 'react';
import { AuthService } from '../services/authService';
import type { Language } from '../App';
import type { User } from '../types';

interface AuthProps {
  language: Language;
  onLogin: (user: User) => void;
  onBack: () => void;
}

const Auth: React.FC<AuthProps> = ({ language, onLogin, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const t = language === 'ko' ? {
    // 로그인
    login: '로그인',
    signup: '회원가입',
    email: '이메일',
    password: '비밀번호',
    name: '이름',
    loginButton: '로그인',
    signupButton: '가입하기',
    forgotPassword: '비밀번호를 잊으셨나요?',
    resetPassword: '비밀번호 재설정',
    sendResetEmail: '재설정 이메일 발송',
    backToLogin: '로그인으로 돌아가기',
    emailVerification: '이메일 인증',
    verificationCode: '인증번호',
    verifyCode: '인증하기',
    sendVerificationCode: '인증번호 발송',
    resendCode: '재발송',
    enterVerificationCode: '이메일로 받은 6자리 인증번호를 입력하세요',
    verificationSuccess: '인증이 완료되었습니다.',
    newPassword: '새 비밀번호',
    confirmPassword: '비밀번호 확인',
    passwordMismatch: '비밀번호가 일치하지 않습니다',
    resetSuccess: '비밀번호가 성공적으로 변경되었습니다.',
    
    // 소셜 로그인
    continueWithGoogle: 'Google로 계속하기',
    continueWithKakao: 'Kakao로 계속하기',
    continueWithNaver: 'Naver로 계속하기',
    orDivider: '또는',
    
    // 토글
    noAccount: '계정이 없으신가요?',
    haveAccount: '이미 계정이 있으신가요?',
    signupHere: '여기서 가입하세요',
    loginHere: '로그인하세요',
    
    // 기타
    back: '뒤로가기',
    loading: '처리 중...',
    
    // 검증
    emailRequired: '이메일을 입력해주세요',
    passwordRequired: '비밀번호를 입력해주세요',
    nameRequired: '이름을 입력해주세요',
    passwordMinLength: '비밀번호는 6자리 이상이어야 합니다',
    
    // 성공 메시지
    signupSuccess: '회원가입이 완료되었습니다! 이메일을 확인해주세요.',
    resetEmailSent: '비밀번호 재설정 이메일이 발송되었습니다.',
    
    // 약관 동의
    agreeToTerms: '서비스 이용약관에 동의합니다',
    agreeToPrivacy: '개인정보처리방침에 동의합니다',
    termsRequired: '서비스 이용약관에 동의해주세요',
    privacyRequired: '개인정보처리방침에 동의해주세요',
    viewTerms: '이용약관 보기',
    viewPrivacy: '개인정보처리방침 보기'
    
  } : {
    // English
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    loginButton: 'Log In',
    signupButton: 'Sign Up',
    forgotPassword: 'Forgot your password?',
    resetPassword: 'Reset Password',
    sendResetEmail: 'Send Reset Email',
    backToLogin: 'Back to Login',
    emailVerification: 'Email Verification',
    verificationCode: 'Verification Code',
    verifyCode: 'Verify',
    sendVerificationCode: 'Send Code',
    resendCode: 'Resend',
    enterVerificationCode: 'Enter the 6-digit code sent to your email',
    verificationSuccess: 'Verification completed successfully.',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    passwordMismatch: 'Passwords do not match',
    resetSuccess: 'Password has been reset successfully.',
    
    // Social login
    continueWithGoogle: 'Continue with Google',
    continueWithKakao: 'Continue with Kakao',
    continueWithNaver: 'Continue with Naver',
    orDivider: 'or',
    
    // Toggle
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    signupHere: 'Sign up here',
    loginHere: 'Log in here',
    
    // Other
    back: 'Back',
    loading: 'Loading...',
    
    // Validation
    emailRequired: 'Please enter your email',
    passwordRequired: 'Please enter your password',
    nameRequired: 'Please enter your name',
    passwordMinLength: 'Password must be at least 6 characters',
    
    // Success messages
    signupSuccess: 'Sign up successful! Please check your email.',
    resetEmailSent: 'Password reset email sent!',
    
    // Terms agreement
    agreeToTerms: 'I agree to the Terms of Service',
    agreeToPrivacy: 'I agree to the Privacy Policy',
    termsRequired: 'Please agree to the Terms of Service',
    privacyRequired: 'Please agree to the Privacy Policy',
    viewTerms: 'View Terms',
    viewPrivacy: 'View Privacy Policy'
  };

  // 폼 검증
  const validateForm = (): string | null => {
    if (!email.trim()) return t.emailRequired;
    if (!password.trim()) return t.passwordRequired;
    if (!isLogin && !name.trim()) return t.nameRequired;
    if (password.length < 6) return t.passwordMinLength;
    
    // 회원가입 시 약관 동의 확인
    if (!isLogin) {
      if (!agreeTerms) return t.termsRequired;
      if (!agreePrivacy) return t.privacyRequired;
    }
    
    return null;
  };

  // 이메일/비밀번호 로그인
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    setIsLoading(true);
    
    try {
      let result;
      if (isLogin) {
        result = await AuthService.signInWithEmail(email, password);
      } else {
        result = await AuthService.signUpWithEmail(email, password, name);
      }

      if (result.success && result.user) {
        if (!isLogin) {
          alert(t.signupSuccess);
        }
        onLogin(result.user);
      } else {
        alert(result.error || '오류가 발생했습니다.');
      }
    } catch (error) {
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 소셜 로그인 약관 동의 확인 (회원가입 시에만)
  const validateSocialLogin = (): boolean => {
    // 로그인 모드일 때는 약관 동의 불필요
    if (isLogin) return true;
    
    if (!agreeTerms) {
      alert(t.termsRequired);
      return false;
    }
    if (!agreePrivacy) {
      alert(t.privacyRequired);
      return false;
    }
    return true;
  };

  // Google 로그인
  const handleGoogleLogin = async () => {
    if (!validateSocialLogin()) return;
    
    setIsLoading(true);
    try {
      const result = await AuthService.signInWithGoogle();
      if (result.success && result.user) {
        onLogin(result.user);
      } else {
        alert(result.error || 'Google 로그인 실패');
      }
    } catch (error) {
      alert('Google 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Kakao 로그인
  const handleKakaoLogin = async () => {
    if (!validateSocialLogin()) return;
    
    setIsLoading(true);
    try {
      const result = await AuthService.signInWithKakao();
      if (result.success && result.user) {
        onLogin(result.user);
      } else {
        alert(result.error || 'Kakao 로그인 실패');
      }
    } catch (error) {
      alert('Kakao 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Naver 로그인
  const handleNaverLogin = async () => {
    if (!validateSocialLogin()) return;
    
    setIsLoading(true);
    try {
      const result = await AuthService.signInWithNaver();
      if (result.success && result.user) {
        onLogin(result.user);
      } else {
        alert(result.error || 'Naver 로그인 실패');
      }
    } catch (error) {
      alert('Naver 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 비밀번호 재설정 이메일 발송
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      alert(t.emailRequired);
      return;
    }

    setIsLoading(true);
    try {
      const result = await AuthService.sendEmailVerification(forgotEmail);
      if (result.success) {
        setResetMessage(t.resetEmailSent);
        setShowEmailVerification(true);
      } else {
        alert(result.error || '오류가 발생했습니다.');
      }
    } catch (error) {
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 이메일 인증코드 확인
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      alert('인증번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await AuthService.verifyEmailCode(forgotEmail, verificationCode);
      if (result.success) {
        setResetMessage(t.verificationSuccess);
        // 임시 토큰 생성 (실제로는 서버에서 발급)
        setResetToken(`reset_token_${Date.now()}`);
        setShowPasswordReset(true);
        setShowEmailVerification(false);
      } else {
        alert(result.error || '인증에 실패했습니다.');
      }
    } catch (error) {
      alert('인증 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 새 비밀번호 설정
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword.trim()) {
      alert(t.passwordRequired);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert(t.passwordMismatch);
      return;
    }
    
    if (newPassword.length < 6) {
      alert(t.passwordMinLength);
      return;
    }

    setIsLoading(true);
    try {
      const result = await AuthService.resetPassword(resetToken, newPassword);
      if (result.success) {
        alert(t.resetSuccess);
        // 모든 상태 초기화
        setShowPasswordReset(false);
        setShowForgotPassword(false);
        setShowEmailVerification(false);
        setForgotEmail('');
        setVerificationCode('');
        setNewPassword('');
        setConfirmPassword('');
        setResetToken('');
        setResetMessage('');
      } else {
        alert(result.error || '비밀번호 재설정에 실패했습니다.');
      }
    } catch (error) {
      alert('비밀번호 재설정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 새 비밀번호 설정 모드
  if (showPasswordReset) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">{t.resetPassword}</h2>
              {resetMessage && (
                <p className="text-green-400 text-sm mt-2">{resetMessage}</p>
              )}
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300 mb-2">
                  {t.newPassword}
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                  {t.confirmPassword}
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? t.loading : t.resetPassword}
              </button>
            </form>

            <div className="text-center mt-6">
              <button
                onClick={() => {
                  setShowPasswordReset(false);
                  setShowForgotPassword(false);
                }}
                className="text-sky-400 hover:text-sky-300 text-sm font-medium"
              >
                {t.backToLogin}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 이메일 인증 모드
  if (showEmailVerification) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">{t.emailVerification}</h2>
              <p className="text-slate-400 text-sm">{t.enterVerificationCode}</p>
              {resetMessage && (
                <p className="text-green-400 text-sm mt-2">{resetMessage}</p>
              )}
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-slate-300 mb-2">
                  {t.verificationCode}
                </label>
                <input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? t.loading : t.verifyCode}
              </button>
            </form>

            <div className="text-center mt-6 space-y-3">
              <button
                onClick={() => handleSendResetEmail({ preventDefault: () => {} } as React.FormEvent)}
                disabled={isLoading}
                className="text-sky-400 hover:text-sky-300 text-sm font-medium disabled:opacity-50"
              >
                {t.resendCode}
              </button>
              <br />
              <button
                onClick={() => {
                  setShowEmailVerification(false);
                  setShowForgotPassword(false);
                }}
                className="text-sky-400 hover:text-sky-300 text-sm font-medium"
              >
                {t.backToLogin}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 비밀번호 재설정 이메일 발송 모드
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">{t.resetPassword}</h2>
              <p className="text-slate-400 text-sm">이메일로 인증번호를 발송합니다</p>
            </div>

            <form onSubmit={handleSendResetEmail} className="space-y-6">
              <div>
                <label htmlFor="forgotEmail" className="block text-sm font-medium text-slate-300 mb-2">
                  {t.email}
                </label>
                <input
                  id="forgotEmail"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? t.loading : t.sendVerificationCode}
              </button>
            </form>

            <div className="text-center mt-6">
              <button
                onClick={() => setShowForgotPassword(false)}
                className="text-sky-400 hover:text-sky-300 text-sm font-medium"
              >
                {t.backToLogin}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <button
              onClick={onBack}
              className="absolute top-6 left-6 text-slate-400 hover:text-white"
            >
              ← {t.back}
            </button>
            <h2 className="text-3xl font-bold text-white mb-2">
              {isLogin ? t.login : t.signup}
            </h2>
          </div>

          {/* 약관 동의 (회원가입 시에만 표시) */}
          {!isLogin && (
            <div className="space-y-3 mb-6 p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <input
                  id="agreeTerms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-sky-600 bg-slate-700 border-slate-600 rounded focus:ring-sky-500 focus:ring-2"
                />
                <label htmlFor="agreeTerms" className="text-sm text-slate-300 leading-5">
                  {t.agreeToTerms}
                  <button
                    type="button"
                    onClick={() => window.open('/TERMS_OF_SERVICE.md', '_blank')}
                    className="ml-2 text-sky-400 hover:text-sky-300 underline"
                  >
                    {t.viewTerms}
                  </button>
                </label>
              </div>
              <div className="flex items-start space-x-3">
                <input
                  id="agreePrivacy"
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="mt-1 w-4 h-4 text-sky-600 bg-slate-700 border-slate-600 rounded focus:ring-sky-500 focus:ring-2"
                />
                <label htmlFor="agreePrivacy" className="text-sm text-slate-300 leading-5">
                  {t.agreeToPrivacy}
                  <button
                    type="button"
                    onClick={() => window.open('/PRIVACY_POLICY.md', '_blank')}
                    className="ml-2 text-sky-400 hover:text-sky-300 underline"
                  >
                    {t.viewPrivacy}
                  </button>
                </label>
              </div>
            </div>
          )}

          {/* 소셜 로그인 */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t.continueWithGoogle}
            </button>

            <button
              onClick={handleKakaoLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              <span className="text-lg font-bold">K</span>
              {t.continueWithKakao}
            </button>

            <button
              onClick={handleNaverLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              <span className="text-lg font-bold">N</span>
              {t.continueWithNaver}
            </button>
          </div>

          {/* 구분선 */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">{t.orDivider}</span>
            </div>
          </div>

          {/* 이메일/비밀번호 폼 */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                  {t.name}
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                {t.email}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                {t.password}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? t.loading : (isLogin ? t.loginButton : t.signupButton)}
            </button>
          </form>

          {/* 비밀번호 찾기 */}
          {isLogin && (
            <div className="text-center mt-4">
              <button
                onClick={() => setShowForgotPassword(true)}
                className="text-sky-400 hover:text-sky-300 text-sm"
              >
                {t.forgotPassword}
              </button>
            </div>
          )}

          {/* 로그인/회원가입 전환 */}
          <div className="text-center mt-6">
            <p className="text-slate-400 text-sm">
              {isLogin ? t.noAccount : t.haveAccount}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  // 모드 전환 시 약관 동의 상태 초기화
                  setAgreeTerms(false);
                  setAgreePrivacy(false);
                }}
                className="text-sky-400 hover:text-sky-300 font-medium"
              >
                {isLogin ? t.signupHere : t.loginHere}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;