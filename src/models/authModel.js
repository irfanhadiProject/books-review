import bcrypt from 'bcrypt';
import db from '../utils/db.js';

export async function findUser(username) {
  return db.query('SELECT id, password_hash FROM users WHERE username =$1', [
    username,
  ]);
}

export async function createUser(username, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return db.query(
    `INSERT INTO users (username, password_hash, created_at)
    VALUES ($1, $2, NOW())
    RETURNING id`,
    [username, hashedPassword]
  );
}
