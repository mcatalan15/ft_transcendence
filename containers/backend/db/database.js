const sqlite3 = require('sqlite3').verbose();

const dbPath = '/usr/src/app/db/mydatabase.db';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

async function saveUserToDatabase(username, email, hashedPassword) {
	return new Promise((resolve, reject) => {
	  const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
	  db.run(query, [username, email, hashedPassword], function (err) {
		if (err) {
		  reject(err);
		} else {
		  resolve(this.lastID);
		}
	  });
	});
  }

async function checkUserExists(username, email) {
	return new Promise((resolve, reject) => {
	  const query = `SELECT * FROM users WHERE username = ? OR email = ?`;
	  db.get(query, [username, email], (err, row) => {
		if (err) reject(err);
		else resolve(row);
	  });
	});
  }
  
async function isDatabaseHealthy() {
	return new Promise((resolve) => {
	  db.get('SELECT 1', (err) => resolve(!err));
	});
  }
  
module.exports = {
	db,
	checkUserExists,
	saveUserToDatabase,
	isDatabaseHealthy,
  };