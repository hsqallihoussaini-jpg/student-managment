import sqlite3 from 'sqlite3';
import path from 'path';
import { promisify } from 'util';
import bcrypt from 'bcryptjs';

const DB_PATH = process.env.DATABASE_PATH || './database.db';

let db: sqlite3.Database;
let isInitialized = false;

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
  
  // Create a promisified run function that handles parameters correctly
  const run = (sql: string, params: any[] = []) => {
    return new Promise<void>((resolve, reject) => {
      database.run(sql, params, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
  };
  
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

    // Teachers table
    await run(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        department TEXT,
        specialization TEXT,
        office TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Messages table for communication
    await run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        senderId INTEGER NOT NULL,
        senderRole TEXT NOT NULL,
        recipientId INTEGER NOT NULL,
        recipientRole TEXT NOT NULL,
        subject TEXT,
        content TEXT NOT NULL,
        isRead BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Teacher notes table for grades and notes on students
    await run(`
      CREATE TABLE IF NOT EXISTS teacher_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacherId INTEGER NOT NULL,
        studentId INTEGER NOT NULL,
        courseId INTEGER,
        grade TEXT,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(teacherId) REFERENCES teachers(id),
        FOREIGN KEY(studentId) REFERENCES students(id),
        FOREIGN KEY(courseId) REFERENCES courses(id)
      )
    `);

    // Update courses table to add teacherId
    await run(`
      CREATE TABLE IF NOT EXISTS courses_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        credits INTEGER,
        semester TEXT,
        teacherId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(teacherId) REFERENCES teachers(id)
      )
    `);

    // Available courses (predefined course templates)
    await run(`
      CREATE TABLE IF NOT EXISTS available_courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        credits INTEGER
      )
    `);

    // Student notes per course
    await run(`
      CREATE TABLE IF NOT EXISTS student_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER NOT NULL,
        courseId INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(studentId) REFERENCES students(id),
        FOREIGN KEY(courseId) REFERENCES courses(id)
      )
    `);

    // Student schedule
    await run(`
      CREATE TABLE IF NOT EXISTS student_schedule (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER NOT NULL,
        courseId INTEGER NOT NULL,
        dayOfWeek TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        room TEXT,
        instructor TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(studentId) REFERENCES students(id),
        FOREIGN KEY(courseId) REFERENCES courses(id)
      )
    `);

    // Assignments (Devoirs)
    await run(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        courseId INTEGER NOT NULL,
        teacherId INTEGER NOT NULL,
        dueDate DATETIME NOT NULL,
        maxScore REAL DEFAULT 20,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(courseId) REFERENCES courses(id),
        FOREIGN KEY(teacherId) REFERENCES teachers(id)
      )
    `);

    // Submissions (Soumissions de devoirs)
    await run(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignmentId INTEGER NOT NULL,
        studentId INTEGER NOT NULL,
        fileName TEXT,
        fileContent TEXT,
        grade REAL,
        feedback TEXT,
        submittedAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(assignmentId) REFERENCES assignments(id),
        FOREIGN KEY(studentId) REFERENCES students(id),
        UNIQUE(assignmentId, studentId)
      )
    `);

    // Quizzes (QCM/Tests)
    await run(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        courseId INTEGER NOT NULL,
        teacherId INTEGER NOT NULL,
        dueDate DATETIME NOT NULL,
        timeLimit INTEGER,
        totalPoints REAL DEFAULT 20,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(courseId) REFERENCES courses(id),
        FOREIGN KEY(teacherId) REFERENCES teachers(id)
      )
    `);

    // Quiz Questions
    await run(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quizId INTEGER NOT NULL,
        questionText TEXT NOT NULL,
        questionType TEXT DEFAULT 'mcq',
        options TEXT,
        correctAnswer TEXT,
        points REAL DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(quizId) REFERENCES quizzes(id)
      )
    `);

    // Quiz Answers (Réponses des étudiants)
    await run(`
      CREATE TABLE IF NOT EXISTS quiz_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quizId INTEGER NOT NULL,
        studentId INTEGER NOT NULL,
        answers TEXT,
        score REAL,
        isSubmitted BOOLEAN DEFAULT 0,
        submittedAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(quizId) REFERENCES quizzes(id),
        FOREIGN KEY(studentId) REFERENCES students(id),
        UNIQUE(quizId, studentId)
      )
    `);

    // Announcements (Annonces)
    await run(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        courseId INTEGER NOT NULL,
        teacherId INTEGER NOT NULL,
        priority TEXT DEFAULT 'normal',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(courseId) REFERENCES courses(id),
        FOREIGN KEY(teacherId) REFERENCES teachers(id)
      )
    `);

    // Course Materials (PDF, Vidéos)
    await run(`
      CREATE TABLE IF NOT EXISTS course_materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        courseId INTEGER NOT NULL,
        teacherId INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT DEFAULT 'pdf',
        fileName TEXT NOT NULL,
        fileUrl TEXT,
        fileSize INTEGER,
        duration INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(courseId) REFERENCES courses(id),
        FOREIGN KEY(teacherId) REFERENCES teachers(id)
      )
    `);

    // Attendance / Presence
    await run(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        courseId INTEGER NOT NULL,
        studentId INTEGER NOT NULL,
        sessionDate DATETIME NOT NULL,
        status TEXT DEFAULT 'present',
        qrCodeScanned BOOLEAN DEFAULT 0,
        markedAt DATETIME,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(courseId) REFERENCES courses(id),
        FOREIGN KEY(studentId) REFERENCES students(id),
        UNIQUE(courseId, studentId, sessionDate)
      )
    `);

    // Notifications
    await run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        studentId INTEGER NOT NULL,
        courseId INTEGER,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        isRead BOOLEAN DEFAULT 0,
        actionUrl TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(studentId) REFERENCES students(id),
        FOREIGN KEY(courseId) REFERENCES courses(id)
      )
    `);

    // Insert predefined courses
    const predefinedCourses = [
      ['ALGO101', 'Algorithme', 'Introduction aux algorithmes et structures de données', 3],
      ['ELEC201', 'Électronique', 'Fondamentaux de l\'électronique numérique et analogique', 4],
      ['ARCH301', 'Architecture', 'Architecture des systèmes et des ordinateurs', 3],
      ['LANG102', 'Langage C', 'Programmation en langage C et concepts de base', 4],
      ['BURO101', 'Bureautique', 'Outils informatiques et logiciels de productivité', 2]
    ];

    for (const [code, name, description, credits] of predefinedCourses) {
      try {
        await run(
          'INSERT OR IGNORE INTO available_courses (code, name, description, credits) VALUES (?, ?, ?, ?)',
          [code, name, description, credits]
        );
      } catch (_) {
        // Course already exists
      }
    }

    // Seed test accounts (student + teacher)
    const existingStudent = await new Promise<any>((resolve, reject) => {
      database.get('SELECT id FROM users WHERE email = ?', ['student@example.com'], (err: any, row: any) => {
        if (err) reject(err); else resolve(row);
      });
    });

    if (!existingStudent) {
      const studentHash = await bcrypt.hash('password123', 10);
      await run('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', 
        ['student@example.com', studentHash, 'Ahmed Etudiant', 'student']);
      await run('INSERT INTO students (firstName, lastName, email, phone, matricule) VALUES (?, ?, ?, ?, ?)',
        ['Ahmed', 'Etudiant', 'student@example.com', '0600000001', 'STU000001']);
    }

    const existingTeacher = await new Promise<any>((resolve, reject) => {
      database.get('SELECT id FROM users WHERE email = ?', ['teacher@example.com'], (err: any, row: any) => {
        if (err) reject(err); else resolve(row);
      });
    });

    if (!existingTeacher) {
      const teacherHash = await bcrypt.hash('password123', 10);
      await run('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        ['teacher@example.com', teacherHash, 'Mohamed Professeur', 'teacher']);
      await run('INSERT INTO teachers (firstName, lastName, email, phone, department, specialization) VALUES (?, ?, ?, ?, ?, ?)',
        ['Mohamed', 'Professeur', 'teacher@example.com', '0600000002', 'Informatique', 'Développement Web']);
    }

    // Seed main user account
    const existingMain = await new Promise<any>((resolve, reject) => {
      database.get('SELECT id FROM users WHERE email = ?', ['h.sqallihoussaini@esisa.ac.ma'], (err: any, row: any) => {
        if (err) reject(err); else resolve(row);
      });
    });

    if (!existingMain) {
      const mainHash = await bcrypt.hash('password123', 10);
      await run('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        ['h.sqallihoussaini@esisa.ac.ma', mainHash, 'Houssaini Sqalli', 'student']);
      await run('INSERT INTO students (firstName, lastName, email, phone, matricule) VALUES (?, ?, ?, ?, ?)',
        ['Houssaini', 'Sqalli', 'h.sqallihoussaini@esisa.ac.ma', '0600000003', 'STU000003']);
    }

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
        if (!isInitialized) {
          await initializeDatabase();
          isInitialized = true;
        }
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
        if (!isInitialized) {
          await initializeDatabase();
          isInitialized = true;
        }
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
        if (!isInitialized) {
          await initializeDatabase();
          isInitialized = true;
        }
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
