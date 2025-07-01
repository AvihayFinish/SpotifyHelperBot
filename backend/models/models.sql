CREATE DATABASE spotify_helper;

-- USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    phone_number TEXT NOT NULL,
    step INT NOT NULL DEFAULT awaiting_credentials,
);

-- SPOTIFY AUTH
CREATE TABLE users_spotify (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    spotify_user_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, spotify_user_id)
);

-- PODCASTS
CREATE TABLE podcasts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    publisher TEXT,
    last_checked TIMESTAMP
);

-- TOPICS
CREATE TABLE topics (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

-- USER <-> TOPIC
CREATE TABLE users_topics (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    topic_id INT REFERENCES topics(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, topic_id)
);

-- USER <-> PODCAST
CREATE TABLE users_podcasts (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    podcast_id TEXT REFERENCES podcasts(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, podcast_id)
);

CREATE TABLE user_search_results (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  results jsonb NOT NULL,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

