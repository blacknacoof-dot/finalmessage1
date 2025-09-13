import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateToken } from '../utils/jwt';
import { AuthenticatedRequest, authenticateToken, requireAdmin } from '../middleware/auth';
import pool from '../database/connection';

const router = express.Router();

// 관리자 로그인
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

    // 관리자 찾기
    const result = await pool.query(
      'SELECT id, email, name, password_hash, role, is_active FROM admins WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];

    if (!admin.is_active) {
      return res.status(401).json({ error: 'Account is disabled' });
    }

    // 비밀번호 확인
    const isValidPassword = await comparePassword(password, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 마지막 로그인 시간 업데이트
    await pool.query(
      'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [admin.id]
    );

    // JWT 토큰 생성
    const token = generateToken({ 
      userId: admin.id, 
      email: admin.email, 
      role: admin.role 
    });

    res.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      },
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 모든 관리자 라우트에 인증 및 권한 확인 적용
router.use(authenticateToken);
router.use(requireAdmin);

// 대시보드 통계
router.get('/dashboard/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [usersResult, messagesResult, verifiedResult, deliveredResult] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM messages'),
      pool.query('SELECT COUNT(*) FROM verifications WHERE is_verified = true'),
      pool.query('SELECT COUNT(*) FROM messages WHERE is_delivered = true')
    ]);

    const stats = {
      totalUsers: parseInt(usersResult.rows[0].count),
      totalMessages: parseInt(messagesResult.rows[0].count),
      verifiedMessages: parseInt(verifiedResult.rows[0].count),
      deliveredMessages: parseInt(deliveredResult.rows[0].count)
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 사용자 관리 - 목록 조회
router.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || '';
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, email, name, provider, is_verified, created_at, 
             (SELECT COUNT(*) FROM messages WHERE user_id = users.id) as message_count
      FROM users
    `;
    let countQuery = 'SELECT COUNT(*) FROM users';
    const queryParams = [];
    let paramIndex = 1;

    if (search) {
      const searchCondition = ` WHERE email ILIKE $${paramIndex} OR name ILIKE $${paramIndex}`;
      query += searchCondition;
      countQuery += searchCondition;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const [usersResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, search ? [`%${search}%`] : [])
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      users: usersResult.rows,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 사용자 상세 조회
router.get('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.id;

    const userResult = await pool.query(
      `SELECT id, email, name, provider, avatar_url, is_verified, created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const messagesResult = await pool.query(
      `SELECT id, title, delivery_date, is_delivered, created_at
       FROM messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [userId]
    );

    res.json({
      success: true,
      user: userResult.rows[0],
      recentMessages: messagesResult.rows
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 메시지 관리 - 목록 조회
router.get('/messages', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const offset = (page - 1) * limit;

    let query = `
      SELECT m.id, m.title, m.delivery_date, m.is_delivered, m.created_at,
             u.email as user_email, u.name as user_name,
             v.is_verified as blockchain_verified
      FROM messages m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN verifications v ON m.id = v.message_id
    `;
    let countQuery = `
      SELECT COUNT(*) FROM messages m
      JOIN users u ON m.user_id = u.id
    `;
    const queryParams = [];
    let paramIndex = 1;

    if (status === 'delivered') {
      const condition = ' WHERE m.is_delivered = true';
      query += condition;
      countQuery += condition;
    } else if (status === 'pending') {
      const condition = ' WHERE m.is_delivered = false AND m.delivery_date > NOW()';
      query += condition;
      countQuery += condition;
    } else if (status === 'overdue') {
      const condition = ' WHERE m.is_delivered = false AND m.delivery_date <= NOW()';
      query += condition;
      countQuery += condition;
    }

    query += ` ORDER BY m.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const [messagesResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery)
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      messages: messagesResult.rows,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 메시지 상세 조회
router.get('/messages/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const messageId = req.params.id;

    const result = await pool.query(
      `SELECT m.*, u.email as user_email, u.name as user_name,
              v.sha256_hash, v.blockchain_tx_hash, v.is_verified, v.verification_date
       FROM messages m
       JOIN users u ON m.user_id = u.id
       LEFT JOIN verifications v ON m.id = v.message_id
       WHERE m.id = $1`,
      [messageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ success: true, message: result.rows[0] });
  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 블록체인 트랜잭션 조회
router.get('/blockchain/transactions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT bt.*, m.title as message_title, u.email as user_email
       FROM blockchain_transactions bt
       JOIN messages m ON bt.message_id = m.id
       JOIN users u ON m.user_id = u.id
       ORDER BY bt.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM blockchain_transactions');
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      transactions: result.rows,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 시스템 설정 조회
router.get('/settings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT key, value, description FROM settings ORDER BY key');

    const settings = result.rows.reduce((acc, row) => {
      acc[row.key] = {
        value: row.value,
        description: row.description
      };
      return acc;
    }, {});

    res.json({ success: true, settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 시스템 설정 업데이트
router.put('/settings', [
  body('settings').isObject(),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { settings } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const [key, value] of Object.entries(settings)) {
        await client.query(
          'UPDATE settings SET value = $1 WHERE key = $2',
          [value, key]
        );
      }

      await client.query('COMMIT');
      res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;