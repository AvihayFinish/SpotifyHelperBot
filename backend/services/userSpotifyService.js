import pool from "../config/db.js";

export async function getUserAccessTokenFromDB(userId) {
    const result = await pool.query(
        `SELECT access_token
         FROM users_spotify
         WHERE user_id = $1`,
        [userId]
    );
    return result.rows[0]?.access_token || null;
}

export async function updateTokensInDB(userId, accessToken, refreshToken, expiresAt) {
    await pool.query(
        `INSERT INTO users_spotify (user_id, access_token, refresh_token, expires_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id) DO UPDATE
         SET access_token = $2, refresh_token = $3, expires_at = $4`,
        [userId, accessToken, refreshToken, expiresAt]
    );
}