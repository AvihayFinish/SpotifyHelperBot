import pool from "../config/db.js";

export async function getUserPodcasts(userId) {
    const result = await pool.query(
        "SELECT p.title\
        FROM users_podcasts up\
        JOIN podcasts p ON up.podcast_id = p.id\
        WHERE up.user_id = $1",
        [userId]
    );
    return result.rows;
}

export async function searchUserPodcasts(userId, searchTerm) {
    const result = await pool.query(
        `SELECT p.title
        FROM users_podcasts up
        JOIN podcasts p ON up.podcast_id = p.id
        WHERE up.user_id = $1 AND p.title ILIKE $2`,
        [userId, `%${searchTerm}%`]
    );
    return result.rows;
}

export async function addUserPodcast(userId, podcastId) {
    await pool.query(
        "INSERT INTO users_podcasts (user_id, podcast_id) VALUES ($1, $2)",
        [userId, podcastId]
    );
}

export async function removeUserPodcast(userId, podcastId) {
    await pool.query(
        "DELETE FROM users_podcasts WHERE user_id = $1 AND podcast_id = $2",
        [userId, podcastId]
    );
}

export async function checkIfUserFollowPodcastById(userId, podcastId) {
    const result = await pool.query(
        `SELECT * FROM users_podcasts WHERE user_id = $1 AND podcast_id = $2`,
        [userId, podcastId]
    )
    return result.rows.length > 0;
}