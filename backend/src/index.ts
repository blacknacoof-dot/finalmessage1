
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth';
import messageRoutes from './routes/messages';
import adminRoutes from './routes/admin';
import subscriptionRoutes from './routes/subscription';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import database connection
import pool from './database/connection';
import { initSQLiteDB, closeSQLiteDB } from './database/sqlite-connection';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

if (NODE_ENV === 'production') {
  app.use(limiter);
}

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://finalmessage-frontend-20250913.s3-website.ap-northeast-2.amazonaws.com',
    'https://finalmessage-backend.loca.lt',
    process.env.CORS_ORIGIN || 'http://localhost:5173'
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV
  });
});

// API routes
app.get('/api', (req: Request, res: Response) => {
  res.json({ 
    message: 'Final Message API Server',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      messages: '/api/messages',
      admin: '/api/admin',
      subscription: '/api/subscription'
    }
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscription', subscriptionRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Database connection test
const testDatabaseConnection = async () => {
  try {
    // SQLite 연결 시도
    await initSQLiteDB();
    console.log('✅ SQLite Database connected successfully');
  } catch (sqliteError) {
    console.log('⚠️ SQLite connection failed, trying PostgreSQL...');
    try {
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('✅ PostgreSQL Database connected successfully');
    } catch (pgError) {
      console.error('❌ All database connections failed:', { sqliteError, pgError });
      if (NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n🔄 Received kill signal, shutting down gracefully...');
  
  try {
    await closeSQLiteDB();
  } catch (error) {
    console.log('SQLite close error (might be using PostgreSQL)');
  }
  
  pool.end(() => {
    console.log('📦 Database pool closed');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the server
const startServer = async () => {
  try {
    await testDatabaseConnection();
    
    app.listen(PORT, () => {
      console.log('🚀 Final Message Backend Server');
      console.log(`📡 Server running on http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`🔒 CORS origin: ${corsOptions.origin}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
      console.log('✨ Ready to handle requests!\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Only start server in non-lambda environment
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startServer();
}

// Export app for Lambda
export default app;
