import pg from 'pg';
import 'dotenv/config';

const { Client } = pg;

let db;

if (process.env.DATABASE_URL) {
  db = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // agar cocok dengan Railway
  });
} else {
  db = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
}
db.connect();

export default db;
