const sqlite3 = require('sqlite3').verbose();

const dbPath = '/usr/src/app/db/mydatabase.db';
const db = new sqlite3.Database(dbPath, (err) => {
if (err) {
	console.error('Error opening database:', err.message);
} else {
	console.log('Connected to SQLite database');
}
});

async function saveUserToDatabase(username, email, hashedPassword, provider) {
	return new Promise((resolve, reject) => {
	const query = `INSERT INTO users (username, email, password, provider) VALUES (?, ?, ?, ?)`;
	const params = [username, email, hashedPassword, provider];

		db.run(query, params, function (err) {
			if (err) {
				console.error('[DB INSERT ERROR] Full error:', {
					message: err.message,
					code: err.code,
					errno: err.errno,
					stack: err.stack
				  });

				if (err.message.includes('UNIQUE constraint failed')) {
					const customError = new Error('Username or email already exists');
					customError.code = 'SQLITE_CONSTRAINT';
					reject(customError);
				} else {
					reject(err);
				}
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
			if (err) {
				console.error('[DB ERROR]', err);
				reject(new Error('Database error'));
				return;
			}
			if (row) {
				resolve({
					exists: true,
					usernameExists: row.username === username,
					emailExists: row.email === email
				});
			} else {
				resolve({ exists: false });
			}
		});
	});
}

async function isDatabaseHealthy() {
	return new Promise((resolve) => {
	db.get('SELECT 1', (err) => resolve(!err));
	});
}

async function getHashedPassword(email) {
	return new Promise((resolve, reject) => {
	const query = `SELECT password FROM users WHERE email = ?`;
		db.get(query, [email], (err, row) => {
			if (err) {
				console.error('[DB ERROR]', err);
				reject(new Error('Database error'));
				return;
			}
			if (row) {
				resolve(row.password);
			} else {
				resolve(null);
			}
		});
	});
}

async function getUserByEmail(email) {
	return new Promise((resolve, reject) => {
	const query = `SELECT * FROM users WHERE email = ?`;
		db.get(query, [email], (err, row) => {
			if (err) {
				console.error('[DB ERROR]', err);
				reject(new Error('Database error'));
				return;
			}
			if (row) {
				resolve(row);
			} else {
				resolve(null);
			}
		});
	});
}

module.exports = {
	db,
	checkUserExists,
	saveUserToDatabase,
	isDatabaseHealthy,
	getHashedPassword,
	getUserByEmail
	// Add other database functions here as needed
};