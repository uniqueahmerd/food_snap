import { pool } from "../../config/database/db.js";

export type UserRow = {
  id: string;
  email: string;
  name: string;
  password: string;
  role?: "admin" | "user";
  created_at: string;
};

export class UserRepositry {
  async findByEmail(email: string): Promise<UserRow | null> {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    return result.rows[0] ?? null;
  }

  async findById(id: string): Promise<Omit<UserRow, "password_hash"> | null> {
    const result = await pool.query(
      "SELECT id, email, name, role, created_at FROM users WHERE id = $1",
      [id]
    );

    return result.rows[0] ?? null;
  }

  async create(
    name: string,
    email: string,
    password: string
  ): Promise<UserRow> {
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, role, created_at",
      [name, email, password]
    );

    return result.rows[0] ?? null;
  }

  async storingRefreshToken(id: string, refreshToken: string) {
    const result = await pool.query(
      "INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2) ",
      [id, refreshToken]
    );

    return result.rows[0] ?? null;
  }

  async updatingRevoked(token: string) {
    const result = await pool.query(
      "UPDATE refresh_tokens SET revoked = true WHERE token = $1",
      [token]
    );

    return result.rows[0] ?? null;
  }

  async checkingTokenInDb(token: string) {
    const result = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1 AND revoked = false AND expires_at > NOW()",
      [token]
    );

    return result.rows[0] ?? null;
  }

  async rotateToken(token: string) {
    const result = await pool.query(
      "UPDATE refresh_tokens SET revoked = true WHERE token = $1",
      [token]
    );

    return result.rows[0] ?? null;
  }
}
