import sqlite3 from 'sqlite3';
import path from 'path';
import { promisify } from 'util';

const DB_PATH = process.env.DATABASE_PATH || './database.db';

let db: sqlite3.Database;

export function openDatabase() {
  return new Promise<sqlite3.Database>((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }
    
    const dbPath = path.resolve(DB_PATH);
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
}

export async function initializeDatabase() {
  const database = await openDatabase();
  const run = promisify(database.run.bind(database));
  
  try {
    // Users table
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Students table
    await run(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        matricule TEXT UNIQUE NOT NULL,
        dateOfBirth TEXT,
        address TEXT,
        city TEXT,
        zipCode TEXT,
        country TEXT,
        enrollmentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Courses table
    await run(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        credits INTEGER,
        semester INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Enrollments table
    await run(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER NOT NULL,
        courseId INTEGER NOT NULL,
        grade TEXT,
        enrollmentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(studentId) REFERENCES students(id),
        FOREIGN KEY(courseId) REFERENCES courses(id),
        UNIQUE(studentId, courseId)
      )
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export function getDatabase() {
  return db;
}

export function runQuery(sql: string, params: any[] = []) {
  return new Promise<any>(async (resolve, reject) => {
    try {
      if (!db) {
        await openDatabase();
      }
      
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    } catch (error) {
      reject(error);
    }
  });
}

export function getQuery(sql: string, params: any[] = []) {
  return new Promise<any>(async (resolve, reject) => {
    try {
      if (!db) {
        await openDatabase();
      }
      
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export function allQuery(sql: string, params: any[] = []) {
  return new Promise<any[]>(async (resolve, reject) => {
    try {
      if (!db) {
        await openDatabase();
      }
      
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    } catch (error) {
      reject(error);
    }
  });
}
