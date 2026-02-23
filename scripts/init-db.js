const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || './database.db';
const dbPath = path.resolve(DB_PATH);

const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }

  console.log('Connected to SQLite database');

  try {
    // Create tables
    await new Promise((resolve, reject) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT DEFAULT 'admin',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );

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
        );

        CREATE TABLE IF NOT EXISTS courses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          credits INTEGER,
          semester INTEGER,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS enrollments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          studentId INTEGER NOT NULL,
          courseId INTEGER NOT NULL,
          grade TEXT,
          enrollmentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(studentId) REFERENCES students(id),
          FOREIGN KEY(courseId) REFERENCES courses(id),
          UNIQUE(studentId, courseId)
        );
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('✓ Tables created');

    // Check if admin user exists
    const user = await new Promise((resolve) => {
      db.get('SELECT * FROM users WHERE email = ?', ['admin@example.com'], (err, row) => {
        resolve(row);
      });
    });

    if (!user) {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
          ['admin@example.com', hashedPassword, 'Administrator', 'admin'],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      console.log('✓ Admin user created (admin@example.com / admin123)');
    } else {
      console.log('✓ Admin user already exists');
    }

    // Add sample data if needed
    const studentCount = await new Promise((resolve) => {
      db.get('SELECT COUNT(*) as count FROM students', (err, row) => {
        resolve(row?.count || 0);
      });
    });

    if (studentCount === 0) {
      console.log('✓ Database initialization complete');
    }

    console.log('\n✅ Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    db.close();
  }
});
