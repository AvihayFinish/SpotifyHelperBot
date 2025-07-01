import pool from "../config/db.js";

export async function registerNewUser(phone_number) {
    await pool.query(
        `INSERT INTO users (phone_number, step) VALUES ($1, $2)`,
        [phone_number, 'awaiting_credentials']
    );
}

export async function getUserByPhoneNumber(phone_number) {
    const result = await pool.query(
        `SELECT * FROM users WHERE phone_number = $1`,
        [phone_number]
    );
    return result.rows[0];
}

export async function updateUserStep(phone_number, step) {
    await pool.query(
        `UPDATE users SET step = $1 WHERE phone_number = $2`,
        [step, phone_number]
    );
}

export async function deleteUser(userId) {
    await pool.query(
        `DELETE FROM users WHERE id = $1`,
        [userId]
    );
}

export async function updateUserSearchResults(userId, searchResults) {
    await pool.query(
        "INSERT INTO user_search_results (user_id, results) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET results = $2",
        [userId, searchResults]
    );
}

export async function getUserSearchResults(userId) {
    const result = await pool.query(
        "SELECT results FROM user_search_results WHERE user_id = $1 ORDER BY saved_at DESC LIMIT 1",
        [userId]
    );
    return result.rows[0] ? result.rows[0].results : null;
}

