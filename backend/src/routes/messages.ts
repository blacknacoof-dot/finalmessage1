import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import pool from '../database/connection';
import crypto from 'crypto';
import { SubscriptionService } from '../services/subscriptionService';

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 메시지 생성
router.post('/', [
  body('title').isLength({ min: 1, max: 255 }).trim(),
  body('content').isLength({ min: 1, max: 10000 }).trim(),
  body('recipientEmails').isArray({ min: 1 }),
  body('recipientEmails.*').isEmail(),
  body('deliveryDate').isISO8601(),
  body('requireLegalNotary').optional().isBoolean(),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const userId = req.user?.userId!;
    const { title, content, recipientEmails, deliveryDate, requireLegalNotary = false } = req.body;

    // 메시지 생성 권한 확인
    const messageCheck = await SubscriptionService.canUseFeature(userId, 'message_send');
    if (!messageCheck.allowed) {
      return res.status(403).json({ 
        error: 'Message creation not allowed',
        reason: messageCheck.reason,
        usage: messageCheck.usage
      });
    }

    // 법적 공증 기능 사용 권한 확인
    if (requireLegalNotary) {
      const notaryCheck = await SubscriptionService.canUseFeature(userId, 'legal_notary');
      if (!notaryCheck.allowed) {
        return res.status(403).json({ 
          error: 'Legal notary feature not available',
          reason: notaryCheck.reason
        });
      }
    }

    // 배송 날짜가 미래인지 확인
    const delivery = new Date(deliveryDate);
    const now = new Date();
    if (delivery <= now) {
      return res.status(400).json({ error: 'Delivery date must be in the future' });
    }

    // SHA-256 해시 생성
    const messageData = `${title}${content}${deliveryDate}${recipientEmails.join(',')}`;
    const verificationHash = crypto.createHash('sha256').update(messageData).digest('hex');

    // 메시지 저장
    const result = await pool.query(
      `INSERT INTO messages (user_id, title, content, recipient_emails, delivery_date, verification_hash, requires_legal_notary) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, title, content, recipientEmails, delivery, verificationHash, requireLegalNotary]
    );

    const message = result.rows[0];

    // 검증 레코드 생성
    await pool.query(
      'INSERT INTO verifications (message_id, sha256_hash, timestamp) VALUES ($1, $2, $3)',
      [message.id, verificationHash, new Date()]
    );

    // 메시지 사용량 증가
    await SubscriptionService.incrementFeatureUsage(userId, 'message_send');

    // 법적 공증 사용량 증가 (필요한 경우)
    if (requireLegalNotary) {
      await SubscriptionService.incrementFeatureUsage(userId, 'legal_notary');
    }

    res.status(201).json({
      success: true,
      message: {
        id: message.id,
        title: message.title,
        content: message.content,
        recipientEmails: message.recipient_emails,
        deliveryDate: message.delivery_date,
        verificationHash: message.verification_hash,
        requiresLegalNotary: message.requires_legal_notary,
        createdAt: message.created_at
      }
    });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 사용자의 메시지 목록 조회
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT id, title, content, recipient_emails, delivery_date, is_delivered, 
              verification_hash, created_at 
       FROM messages 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM messages WHERE user_id = $1',
      [userId]
    );

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      messages: result.rows,
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

// 특정 메시지 조회
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId!;
    const messageId = req.params.id;

    const result = await pool.query(
      `SELECT m.*, v.sha256_hash, v.blockchain_tx_hash, v.is_verified, v.verification_date
       FROM messages m
       LEFT JOIN verifications v ON m.id = v.message_id
       WHERE m.id = $1 AND m.user_id = $2`,
      [messageId, userId]
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

// 메시지 업데이트 (배송 전에만 가능)
router.put('/:id', [
  body('title').optional().isLength({ min: 1, max: 255 }).trim(),
  body('content').optional().isLength({ min: 1, max: 10000 }).trim(),
  body('recipientEmails').optional().isArray({ min: 1 }),
  body('recipientEmails.*').optional().isEmail(),
  body('deliveryDate').optional().isISO8601(),
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const userId = req.user?.userId!;
    const messageId = req.params.id;

    // 메시지 존재 및 소유권 확인
    const checkResult = await pool.query(
      'SELECT is_delivered FROM messages WHERE id = $1 AND user_id = $2',
      [messageId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (checkResult.rows[0].is_delivered) {
      return res.status(400).json({ error: 'Cannot update delivered message' });
    }

    const { title, content, recipientEmails, deliveryDate } = req.body;
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }

    if (content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(content);
    }

    if (recipientEmails !== undefined) {
      updates.push(`recipient_emails = $${paramIndex++}`);
      values.push(recipientEmails);
    }

    if (deliveryDate !== undefined) {
      const delivery = new Date(deliveryDate);
      const now = new Date();
      if (delivery <= now) {
        return res.status(400).json({ error: 'Delivery date must be in the future' });
      }
      updates.push(`delivery_date = $${paramIndex++}`);
      values.push(delivery);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(messageId, userId);

    await pool.query(
      `UPDATE messages SET ${updates.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}`,
      values
    );

    res.json({ success: true, message: 'Message updated successfully' });
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 메시지 삭제 (배송 전에만 가능)
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId!;
    const messageId = req.params.id;

    // 메시지 존재 및 소유권 확인
    const checkResult = await pool.query(
      'SELECT is_delivered FROM messages WHERE id = $1 AND user_id = $2',
      [messageId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (checkResult.rows[0].is_delivered) {
      return res.status(400).json({ error: 'Cannot delete delivered message' });
    }

    await pool.query('DELETE FROM messages WHERE id = $1 AND user_id = $2', [messageId, userId]);

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 메시지 검증
router.get('/:id/verify', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const messageId = req.params.id;

    const result = await pool.query(
      `SELECT m.title, m.content, m.delivery_date, m.recipient_emails, m.verification_hash,
              v.sha256_hash, v.blockchain_tx_hash, v.is_verified, v.verification_date
       FROM messages m
       LEFT JOIN verifications v ON m.id = v.message_id
       WHERE m.id = $1`,
      [messageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const message = result.rows[0];

    // SHA-256 해시 재계산하여 검증
    const messageData = `${message.title}${message.content}${message.delivery_date.toISOString()}${message.recipient_emails.join(',')}`;
    const calculatedHash = crypto.createHash('sha256').update(messageData).digest('hex');

    const isValid = calculatedHash === message.verification_hash;

    res.json({
      success: true,
      verification: {
        isValid,
        originalHash: message.verification_hash,
        calculatedHash,
        blockchainTxHash: message.blockchain_tx_hash,
        isBlockchainVerified: message.is_verified,
        verificationDate: message.verification_date
      }
    });
  } catch (error) {
    console.error('Verify message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;