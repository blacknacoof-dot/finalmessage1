import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateToken, generateResetToken, verifyResetToken } from '../utils/jwt';
import pool from '../database/connection';
import { getSQLiteDB } from '../database/sqlite-connection';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';

const router = express.Router();

// 회원가입
router.post('/signup', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').isLength({ min: 1 }).trim(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { email, password, name } = req.body;

    // 이미 존재하는 사용자 확인
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // 비밀번호 해시화
    const hashedPassword = await hashPassword(password);

    // 사용자 생성
    const result = await pool.query(
      'INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
      [email, name, hashedPassword]
    );

    const user = result.rows[0];
    
    // JWT 토큰 생성
    const token = generateToken({ userId: user.id, email: user.email });

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 로그인
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { email, password } = req.body;

    // 사용자 찾기
    const result = await pool.query(
      'SELECT id, email, name, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // 비밀번호 확인
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // JWT 토큰 생성
    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 비밀번호 재설정 요청
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { email } = req.body;

    // 사용자 확인
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      // 보안상 사용자가 존재하지 않아도 성공 응답
      return res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
    }

    // 재설정 토큰 생성
    const resetToken = generateResetToken(email);
    const expiresAt = new Date(Date.now() + 3600000); // 1시간 후

    // DB에 저장
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
      [resetToken, expiresAt, email]
    );

    // TODO: 실제로는 이메일 발송
    console.log(`Reset token for ${email}: ${resetToken}`);

    res.json({ success: true, message: 'Reset link sent to email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 임시: 사용자 목록 조회 (관리자 권한 불필요)
router.get('/users', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT id, email, name, provider, is_verified, created_at, 
             (SELECT COUNT(*) FROM messages WHERE user_id = users.id) as message_count
      FROM users
      ORDER BY created_at DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 소셜 로그인/가입
router.post('/social-login', [
  body('provider').isIn(['google', 'kakao', 'naver']),
  body('email').isEmail().normalizeEmail(),
  body('name').optional().isString(),
  body('socialId').notEmpty(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { provider, email, name, socialId } = req.body;
    
    let user: any = null;
    
    try {
      const db = await getSQLiteDB();

      // 기존 사용자 확인
      user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
      
      if (user) {
        // 기존 사용자 - 로그인
        // 소셜 프로바이더 정보 업데이트
        await db.run(
          'UPDATE users SET provider = ?, social_id = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
          [provider, socialId, email]
        );
      } else {
        // 새 사용자 - 가입
        const result = await db.run(
          `INSERT INTO users (email, name, provider, social_id, is_verified, created_at, updated_at) 
           VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [email, name || `${provider} User`, provider, socialId]
        );
        
        // 새로 생성된 사용자 조회
        user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
      }
    } catch (error) {
      console.error('SQLite Social login error:', error);
      // PostgreSQL 폴백
      try {
        // 기존 사용자 확인
        let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length > 0) {
          // 기존 사용자 - 로그인
          user = result.rows[0];
          
          // 소셜 프로바이더 정보 업데이트
          await pool.query(
            'UPDATE users SET provider = $1, social_id = $2, updated_at = CURRENT_TIMESTAMP WHERE email = $3',
            [provider, socialId, email]
          );
        } else {
          // 새 사용자 - 가입
          result = await pool.query(
            `INSERT INTO users (email, name, provider, social_id, is_verified) 
             VALUES ($1, $2, $3, $4, true) 
             RETURNING *`,
            [email, name || `${provider} User`, provider, socialId]
          );
          user = result.rows[0];
        }
      } catch (pgError) {
        console.error('PostgreSQL Social login error:', pgError);
        throw error; // SQLite 에러를 다시 던짐
      }
    }

    // JWT 토큰 생성
    const token = generateToken({ 
      userId: user.id, 
      email: user.email 
    });

    res.json({
      success: true,
      message: 'Social login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider
      },
      token
    });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// 비밀번호 재설정
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 }),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { token, password } = req.body;

    // 토큰 검증
    const { email } = verifyResetToken(token);

    // DB에서 토큰 확인
    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND reset_token = $2 AND reset_token_expires > NOW()',
      [email, token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // 새 비밀번호 해시화
    const hashedPassword = await hashPassword(password);

    // 비밀번호 업데이트 및 토큰 삭제
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE email = $2',
      [hashedPassword, email]
    );

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 프로필 조회
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const result = await pool.query(
      'SELECT id, email, name, avatar_url, is_verified, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 프로필 업데이트
router.put('/profile', authenticateToken, [
  body('name').optional().isLength({ min: 1 }).trim(),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const userId = req.user?.userId;
    const { name } = req.body;

    await pool.query(
      'UPDATE users SET name = $1 WHERE id = $2',
      [name, userId]
    );

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;