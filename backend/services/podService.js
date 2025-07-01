import pool from "../config/db.js";

export async function getPodAndFollowers() {
    const podAndTheFollowersQuery = await pool.query(
        `SELECT p.id AS podcast_id, p.title, p.last_checked, 
        json_agg(json_build_object('user_id', u.id, 'phone_number', u.phone_number)) AS users
        FROM podcasts p
        JOIN users_podcasts up ON p.id = up.podcast_id
        JOIN users u ON up.user_id = u.id
        GROUP BY p.id`
    );
    return podAndTheFollowersQuery.rows;
}

export async function updateLastChecked(podcastId, lastChecked) {
    const result = await pool.query(
        "UPDATE podcasts SET last_checked = $1 WHERE id = $2",
        [lastChecked, podcastId]
    );
}

export async function addPodcast(podcast) {
    await pool.query(
        "INSERT INTO podcasts (id, title, description, publisher, last_checked) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING",
        [podcast.id, podcast.name, podcast.description, podcast.publisher, new Date()]
    );
}

export async function removePodcast(podcastId) {
    await pool.query(
        "DELETE FROM podcasts WHERE id = $1",
        [podcastId]
    );
}