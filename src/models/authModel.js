export async function findUserByUsername(client, username) {
  return client.query(
    `SELECT id, password_hash, is_active, role 
     FROM users 
     WHERE username =$1`, 
     [username]
  );
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
