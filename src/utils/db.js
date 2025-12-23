import pg from 'pg';

const { Pool } = pg;

function createPool() {
  if (process.env.NODE_ENV === 'test') {
    return new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    })
  }

  if (process.env.NODE_ENV === 'production') {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  }

  // local / dev
  return new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  })
}

if (process.env.NODE_ENV === 'test') {
  if (!process.env.DB_NAME || !process.env.DB_NAME.endsWith('_test')) {
    throw new Error(
      `Refusing to run in test mode on DB: ${process.env.DB_NAME}`
    )
  }
}

const pool = createPool()


export default pool;
