const sqlite3 = require('sqlite3');
const path = require('path');

const db = new sqlite3.Database(path.resolve('./database.db'));

db.all("SELECT email, (SELECT COUNT(*) FROM students WHERE email='student@example.com') as student_exists FROM users WHERE email='student@example.com'", [], (err, rows) => {
  if (err) throw err;
  console.log('Student in users table:', rows.length > 0);
  
  db.all("SELECT * FROM users", [], (err, rows) => {
    console.log('Total users:', rows?.length || 0);
    rows?.forEach(u => console.log('  -', u.email, u.role));
    db.close();
  });
});
