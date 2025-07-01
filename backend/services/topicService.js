import pool from "../config/db.js";

export async function getTopicByName(topicName) {
    const result = await pool.query(
        `SELECT * FROM topics WHERE name = $1`,
        [topicName]
    );
    if (result.rows.length === 0) {
        return null;
    }
    return result.rows[0];
}

export async function addTopic(topicName) {
    const result = await pool.query(
        `INSERT INTO topics (name) VALUES ($1) RETURNING *`,
        [topicName]
    );
    return result.rows[0];
}

export async function removeTopic(topicId) {
    await pool.query(
        `DELETE FROM topics WHERE id = $1`,
        [topicId]
    );
}

export async function getTopicIdByName(topicName) {
    const result = await pool.query(
        `SELECT id FROM topics WHERE name = $1`,
        [topicName]
    );
    if (result.rows.length === 0) {
        return null;
    }
    return result.rows[0].id;
}