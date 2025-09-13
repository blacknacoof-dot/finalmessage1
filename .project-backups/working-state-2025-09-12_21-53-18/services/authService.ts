import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  User as FirebaseUser,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase';
import type { User } from '../types';

// 소셜 로그인 프로바이더들
const googleProvider = new GoogleAuthProvider();

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export class AuthService {
  
  /**
   * 이메일/비밀번호로 회원가입
   */
  static async signUpWithEmail(email: string, password: string, name: string): Promise<AuthResult> {
    try {
      // Firebase API 키가 유효하지 않은 경우 시뮬레이션
      if (import.meta.env.VITE_FIREBASE_API_KEY === 'test-firebase-api-key') {
        // 시뮬레이션 지연
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const user: User = {
          name: name,
          email: email,
          plan: 'Free',
          subscription: null
        };
        
        return {
          success: true,
          user
        };
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // 사용자 프로필 업데이트
      await updateProfile(firebaseUser, {
        displayName: name
      });
      
      // 이메일 인증 발송
      await sendEmailVerification(firebaseUser);
      
      const user: User = {
        name: name,
        email: email,
        plan: 'Free',
        subscription: null
      };
      
      return {
        success: true,
        user
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }
  
  /**
   * 이메일/비밀번호로 로그인
   */
  static async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      // Firebase API 키가 유효하지 않은 경우 시뮬레이션
      if (import.meta.env.VITE_FIREBASE_API_KEY === 'test-firebase-api-key') {
        // 시뮬레이션 지연
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 간단한 검증 (실제로는 Firebase가 처리)
        if (password.length < 6) {
          return {
            success: false,
            error: '비밀번호는 6자리 이상이어야 합니다.'
          };
        }
        
        const user: User = {
          name: email.split('@')[0],
          email: email,
          plan: 'Free',
          subscription: null
        };
        
        return {
          success: true,
          user
        };
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const user: User = {
        name: firebaseUser.displayName || email.split('@')[0],
        email: firebaseUser.email || email,
        plan: 'Free', // 실제로는 DB에서 조회
        subscription: null
      };
      
      return {
        success: true,
        user
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }
  
  /**
   * Google 소셜 로그인
   */
  static async signInWithGoogle(): Promise<AuthResult> {
    try {
      // Firebase API 키가 유효하지 않은 경우 시뮬레이션
      if (import.meta.env.VITE_FIREBASE_API_KEY === 'test-firebase-api-key') {
        // 시뮬레이션 지연
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const user: User = {
          name: 'Google User',
          email: 'user@gmail.com',
          plan: 'Free',
          subscription: null
        };
        
        return {
          success: true,
          user
        };
      }

      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      const user: User = {
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email || '',
        plan: 'Free',
        subscription: null
      };
      
      return {
        success: true,
        user
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }
  
  /**
   * 카카오 로그인 (Kakao JavaScript SDK 사용)
   */
  static async signInWithKakao(): Promise<AuthResult> {
    try {
      // 실제로는 Kakao SDK 사용
      // 여기서는 시뮬레이션
      if (typeof window.Kakao === 'undefined') {
        return {
          success: false,
          error: 'Kakao SDK가 로드되지 않았습니다.'
        };
      }
      
      return new Promise((resolve) => {
        window.Kakao.Auth.login({
          success: (authObj: any) => {
            window.Kakao.API.request({
              url: '/v2/user/me',
              success: (res: any) => {
                const user: User = {
                  name: res.properties.nickname || 'Kakao User',
                  email: res.kakao_account.email || `kakao_${res.id}@kakao.com`,
                  plan: 'Free',
                  subscription: null
                };
                resolve({ success: true, user });
              },
              fail: () => {
                resolve({ success: false, error: '카카오 사용자 정보 조회 실패' });
              }
            });
          },
          fail: () => {
            resolve({ success: false, error: '카카오 로그인 실패' });
          }
        });
      });
    } catch (error: any) {
      return {
        success: false,
        error: '카카오 로그인 중 오류 발생'
      };
    }
  }
  
  /**
   * 네이버 로그인 (Naver Login SDK 사용)
   */
  static async signInWithNaver(): Promise<AuthResult> {
    try {
      // 실제로는 네이버 로그인 SDK 사용
      // 여기서는 시뮬레이션
      if (typeof window.naver === 'undefined') {
        return {
          success: false,
          error: '네이버 로그인 SDK가 로드되지 않았습니다.'
        };
      }
      
      return new Promise((resolve) => {
        const naverLogin = new window.naver.LoginWithNaverId({
          clientId: import.meta.env.VITE_NAVER_CLIENT_ID || 'test_naver_client_id',
          callbackUrl: window.location.origin + '/callback',
          isPopup: true
        });
        
        naverLogin.getLoginStatus((status: boolean) => {
          if (status) {
            const user: User = {
              name: naverLogin.user.name || 'Naver User',
              email: naverLogin.user.email || `naver_${naverLogin.user.id}@naver.com`,
              plan: 'Free',
              subscription: null
            };
            resolve({ success: true, user });
          } else {
            naverLogin.authorize();
          }
        });
      });
    } catch (error: any) {
      return {
        success: false,
        error: '네이버 로그인 중 오류 발생'
      };
    }
  }
  
  /**
   * 로그아웃
   */
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
      
      // 카카오 로그아웃
      if (window.Kakao && window.Kakao.Auth) {
        window.Kakao.Auth.logout();
      }
      
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  }
  
  /**
   * 비밀번호 재설정 이메일 발송
   */
  static async sendPasswordReset(email: string): Promise<AuthResult> {
    try {
      // Firebase API 키가 유효하지 않은 경우 시뮬레이션
      if (import.meta.env.VITE_FIREBASE_API_KEY === 'test-firebase-api-key') {
        // 시뮬레이션 지연
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 이메일 검증 (실제로는 Firebase가 처리)
        const savedUser = localStorage.getItem('finalmessage_user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          if (user.email === email) {
            // 비밀번호 재설정 토큰 생성
            const resetToken = 'reset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const resetData = {
              email: email,
              token: resetToken,
              expires: Date.now() + (1000 * 60 * 60 * 24), // 24시간
              used: false
            };
            
            localStorage.setItem(`password_reset_${resetToken}`, JSON.stringify(resetData));
            
            // 실제로는 이메일 서비스로 전송
            console.log('비밀번호 재설정 이메일 발송:', {
              to: email,
              resetLink: `${window.location.origin}/finalmessage/reset-password?token=${resetToken}`
            });
            
            return {
              success: true,
              error: undefined
            };
          } else {
            return {
              success: false,
              error: '등록되지 않은 이메일 주소입니다.'
            };
          }
        } else {
          return {
            success: false,
            error: '등록되지 않은 이메일 주소입니다.'
          };
        }
      }

      await sendPasswordResetEmail(auth, email);
      return {
        success: true
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * 비밀번호 재설정 토큰 검증
   */
  static async verifyResetToken(token: string): Promise<{
    valid: boolean;
    email?: string;
    error?: string;
  }> {
    try {
      const resetData = localStorage.getItem(`password_reset_${token}`);
      if (!resetData) {
        return {
          valid: false,
          error: '유효하지 않은 재설정 링크입니다.'
        };
      }

      const data = JSON.parse(resetData);
      
      if (data.used) {
        return {
          valid: false,
          error: '이미 사용된 재설정 링크입니다.'
        };
      }

      if (Date.now() > data.expires) {
        return {
          valid: false,
          error: '만료된 재설정 링크입니다. 새로 요청해주세요.'
        };
      }

      return {
        valid: true,
        email: data.email
      };
    } catch (error) {
      return {
        valid: false,
        error: '재설정 링크 검증 중 오류가 발생했습니다.'
      };
    }
  }

  /**
   * 새 비밀번호로 재설정
   */
  static async resetPassword(token: string, newPassword: string): Promise<AuthResult> {
    try {
      // 토큰 검증
      const tokenVerification = await this.verifyResetToken(token);
      if (!tokenVerification.valid) {
        return {
          success: false,
          error: tokenVerification.error
        };
      }

      // Firebase API 키가 유효하지 않은 경우 시뮬레이션
      if (import.meta.env.VITE_FIREBASE_API_KEY === 'test-firebase-api-key') {
        // 시뮬레이션 지연
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 비밀번호 검증
        if (newPassword.length < 6) {
          return {
            success: false,
            error: '비밀번호는 6자리 이상이어야 합니다.'
          };
        }

        // 토큰을 사용된 것으로 표시
        const resetData = JSON.parse(localStorage.getItem(`password_reset_${token}`)!);
        resetData.used = true;
        localStorage.setItem(`password_reset_${token}`, JSON.stringify(resetData));

        // 사용자 정보 업데이트 (실제로는 데이터베이스에서 처리)
        console.log('비밀번호가 성공적으로 재설정되었습니다:', tokenVerification.email);

        return {
          success: true,
          error: undefined
        };
      }

      // 실제 Firebase 처리는 여기서
      // confirmPasswordReset(auth, oobCode, newPassword) 사용

      return {
        success: true
      };
    } catch (error: any) {
      return {
        success: false,
        error: '비밀번호 재설정 중 오류가 발생했습니다.'
      };
    }
  }

  /**
   * 이메일 인증 코드 발송
   */
  static async sendEmailVerification(email: string): Promise<AuthResult> {
    try {
      // Firebase API 키가 유효하지 않은 경우 시뮬레이션
      if (import.meta.env.VITE_FIREBASE_API_KEY === 'test-firebase-api-key') {
        // 시뮬레이션 지연
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 6자리 인증 코드 생성
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationData = {
          email: email,
          code: verificationCode,
          expires: Date.now() + (1000 * 60 * 5), // 5분
          attempts: 0,
          verified: false
        };
        
        localStorage.setItem(`email_verification_${email}`, JSON.stringify(verificationData));
        
        // 실제로는 이메일 서비스로 전송
        console.log('이메일 인증 코드 발송:', {
          to: email,
          code: verificationCode
        });
        
        return {
          success: true,
          error: undefined
        };
      }

      // 실제 Firebase 처리
      const currentUser = auth.currentUser;
      if (currentUser) {
        await sendEmailVerification(currentUser);
      }
      
      return {
        success: true
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  /**
   * 이메일 인증 코드 검증
   */
  static async verifyEmailCode(email: string, code: string): Promise<AuthResult> {
    try {
      const verificationData = localStorage.getItem(`email_verification_${email}`);
      if (!verificationData) {
        return {
          success: false,
          error: '인증 코드가 존재하지 않습니다. 새로 요청해주세요.'
        };
      }

      const data = JSON.parse(verificationData);
      
      if (data.verified) {
        return {
          success: false,
          error: '이미 인증된 이메일입니다.'
        };
      }

      if (Date.now() > data.expires) {
        return {
          success: false,
          error: '인증 코드가 만료되었습니다. 새로 요청해주세요.'
        };
      }

      if (data.attempts >= 5) {
        return {
          success: false,
          error: '인증 시도 횟수를 초과했습니다. 새로 요청해주세요.'
        };
      }

      if (data.code !== code) {
        data.attempts += 1;
        localStorage.setItem(`email_verification_${email}`, JSON.stringify(data));
        return {
          success: false,
          error: `잘못된 인증 코드입니다. (${data.attempts}/5)`
        };
      }

      // 인증 성공
      data.verified = true;
      localStorage.setItem(`email_verification_${email}`, JSON.stringify(data));

      return {
        success: true,
        error: undefined
      };
    } catch (error) {
      return {
        success: false,
        error: '인증 코드 검증 중 오류가 발생했습니다.'
      };
    }
  }
  
  /**
   * 현재 사용자 상태 감지
   */
  static onAuthStateChange(callback: (user: User | null) => void): () => void {
    // Firebase API 키가 유효하지 않은 경우 시뮬레이션
    if (import.meta.env.VITE_FIREBASE_API_KEY === 'test-firebase-api-key') {
      // 로컬스토리지에서 사용자 정보 확인
      const checkAuth = () => {
        const savedUser = localStorage.getItem('finalmessage_user');
        if (savedUser && savedUser !== 'null') {
          try {
            const user = JSON.parse(savedUser);
            callback(user);
          } catch {
            callback(null);
          }
        } else {
          callback(null);
        }
      };
      
      // 초기 체크
      setTimeout(checkAuth, 100);
      
      // 빈 함수 반환 (실제로는 Firebase unsubscribe 함수)
      return () => {};
    }

    return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const user: User = {
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          plan: 'Free', // 실제로는 DB에서 조회
          subscription: null
        };
        callback(user);
      } else {
        callback(null);
      }
    });
  }
  
  /**
   * 에러 메시지 변환
   */
  private static getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return '등록되지 않은 이메일입니다.';
      case 'auth/wrong-password':
        return '비밀번호가 올바르지 않습니다.';
      case 'auth/email-already-in-use':
        return '이미 사용 중인 이메일입니다.';
      case 'auth/weak-password':
        return '비밀번호는 6자리 이상이어야 합니다.';
      case 'auth/invalid-email':
        return '유효하지 않은 이메일 형식입니다.';
      case 'auth/popup-closed-by-user':
        return '로그인이 취소되었습니다.';
      case 'auth/popup-blocked':
        return '팝업이 차단되었습니다. 팝업을 허용해주세요.';
      default:
        return '로그인 중 오류가 발생했습니다.';
    }
  }
}

// 전역 타입 선언
declare global {
  interface Window {
    Kakao: any;
    naver: any;
  }
}