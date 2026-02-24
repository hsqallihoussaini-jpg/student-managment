const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.resolve('./database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  
  db.all('SELECT email, password FROM users', (err, rows) => {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('\n=== Users in Database ===');
      if (rows && rows.length > 0) {
        rows.forEach(row => {
          console.log(`Email: ${row.email}`);
          console.log(`Password Hash: ${row.password.substring(0, 20)}...`);
          console.log('---');
        });
      } else {
        console.log('No users found!');
      }
    }
    db.close();
  });
});
