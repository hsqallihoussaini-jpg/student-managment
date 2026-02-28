const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.resolve('./database.db');
const db = new sqlite3.Database(dbPath);

const promisify = (fn) => new Promise((resolve, reject) => {
  fn((err, result) => err ? reject(err) : resolve(result));
});

async function createTestAccounts() {
  try {
    // Hash passwords
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create student user and account
    console.log('Creating student account...');
    await promisify((cb) => db.run(
      `INSERT OR REPLACE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)`,
      ['student@example.com', hashedPassword, 'Étudiant Test', 'student'],
      cb
    ));
    
    await promisify((cb) => db.run(
      `INSERT OR REPLACE INTO students (firstName, lastName, email, matricule) VALUES (?, ?, ?, ?)`,
      ['Étudiant', 'Test', 'student@example.com', 'STU001'],
      cb
    ));
    
    // Create teacher user and account
    console.log('Creating teacher account...');
    await promisify((cb) => db.run(
      `INSERT OR REPLACE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)`,
      ['teacher@example.com', hashedPassword, 'Professeur Test', 'teacher'],
      cb
    ));
    
    await promisify((cb) => db.run(
      `INSERT OR REPLACE INTO teachers (firstName, lastName, email) VALUES (?, ?, ?)`,
      ['Professeur', 'Test', 'teacher@example.com'],
      cb
    ));
    
    // Create default courses
    console.log('Creating courses...');
    const courses = [
      { code: 'ALGO101', name: 'Algorithme', description: 'Introduction to Algorithms', credits: 3 },
      { code: 'ELEC201', name: 'Électronique', description: 'Electronics Basics', credits: 3 },
      { code: 'ARCH301', name: 'Architecture', description: 'System Architecture', credits: 4 },
      { code: 'LANG101', name: 'Langage C', description: 'C Programming', credits: 3 },
      { code: 'BUREAU101', name: 'Bureautique', description: 'Office Suite', credits: 2 }
    ];
    
    for (const course of courses) {
      await promisify((cb) => db.run(
        `INSERT OR REPLACE INTO courses (code, name, description, credits) VALUES (?, ?, ?, ?)`,
        [course.code, course.name, course.description, course.credits],
        cb
      ));
    }
    
    console.log('✓ All test accounts and courses created successfully!');
    console.log('\nTest Credentials:');
    console.log('Student: student@example.com / password123');
    console.log('Teacher: teacher@example.com / password123');
    
    db.close();
  } catch (error) {
    console.error('Error:', error);
    db.close();
    process.exit(1);
  }
}

createTestAccounts();
