import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

// SQLite 데이터베이스 연결
let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export const initSQLiteDB = async (): Promise<Database<sqlite3.Database, sqlite3.Statement>> => {
    if (db) return db;

    // 데이터베이스 파일 경로
    const dbPath = path.join(process.cwd(), 'data', 'finalmessage.db');
    
    // data 디렉토리 생성
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // SQLite 데이터베이스 열기
    db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    console.log('✅ SQLite database connected successfully');
    
    // 테이블 생성
    await createTables();
    
    return db;
};

const createTables = async () => {
    if (!db) throw new Error('Database not initialized');

    // 사용자 테이블
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password_hash TEXT,
            provider TEXT DEFAULT 'email',
            provider_id TEXT,
            avatar_url TEXT,
            is_verified BOOLEAN DEFAULT 0,
            verification_token TEXT,
            reset_token TEXT,
            reset_token_expires DATETIME,
            email_verification_code TEXT,
            email_verification_expires DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 메시지 테이블
    await db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            recipient_emails TEXT,
            delivery_date DATETIME NOT NULL,
            is_delivered BOOLEAN DEFAULT 0,
            delivery_method TEXT DEFAULT 'email',
            blockchain_hash TEXT,
            verification_hash TEXT,
            requires_legal_notary BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // 결제 테이블
    await db.exec(`
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            message_id INTEGER,
            amount DECIMAL(10,2) NOT NULL,
            currency TEXT DEFAULT 'KRW',
            payment_method TEXT,
            payment_id TEXT UNIQUE,
            merchant_uid TEXT UNIQUE,
            status TEXT DEFAULT 'pending',
            paid_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL
        )
    `);

    // 관리자 테이블
    await db.exec(`
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            is_active BOOLEAN DEFAULT 1,
            last_login DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 기본 관리자 계정 생성 (비밀번호: admin123)
    await db.run(`
        INSERT OR IGNORE INTO admins (email, name, password_hash, role) 
        VALUES ('admin@finalmessage.com', 'Administrator', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeQEQOTDbY7QqYaAK', 'super_admin')
    `);

    console.log('✅ SQLite tables created successfully');
};

export const getSQLiteDB = (): Database<sqlite3.Database, sqlite3.Statement> => {
    if (!db) throw new Error('Database not initialized. Call initSQLiteDB first.');
    return db;
};

export const closeSQLiteDB = async (): Promise<void> => {
    if (db) {
        await db.close();
        db = null;
        console.log('📦 SQLite database connection closed');
    }
};