import pool from "../config/db.js";

export async function getUserTopics(userId) {
    const result = await pool.query(
        `SELECT t.name
         FROM users_topics ut
         JOIN topics t ON ut.topic_id = t.id
         WHERE ut.user_id = $1`,
        [userId]
    );
    return result.rows;
}

export async function getTopicsPerUser() {
    const topicsPerUserQuery = await pool.query(
        `SELECT u.id AS user_id, array_agg(t.name) AS topics
        FROM users u
        JOIN users_topics ut ON u.id = ut.user_id
        JOIN topics t ON ut.topic_id = t.id
        GROUP BY u.id`
    );
    return topicsPerUserQuery.rows;
}

export async function addUserTopic(userId, topicId) {
    await pool.query(
        `INSERT INTO users_topics (user_id, topic_id) VALUES ($1, $2)`,
        [userId, topicId]
    );
}

export async function removeUserTopic(userId, topicId) {
    await pool.query(
        `DELETE FROM users_topics WHERE user_id = $1 AND topic_id = $2`,
        [userId, topicId]
    );
}

export async function checkIfUserHasTopic(userId, topicId) {
    const result = await pool.query(
        `SELECT * FROM users_topics WHERE user_id = $1 AND topic_id = $2`,
        [userId, topicId]
    );
    return result.rows.length > 0;
}