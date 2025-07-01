import axios from "axios";
import dotenv from "dotenv";
import asyncHandler from "express-async-handler";
import pool from "../config/db.js";

dotenv.config();

const reqAccessToken = asyncHandler(async(typeOfRequest, dataType) => {
    const params = new URLSearchParams();
    params.append('grant_type', typeOfRequest);
    if (typeOfRequest === 'refresh_token') {
        params.append('refresh_token', dataType);
    } else {
        params.append('code', dataType);
    }
    params.append('redirect_uri', process.env.SPOTIFY_REDIRECT_URI);
    params.append('client_id', process.env.SPOTIFY_CLIENT_ID);
    params.append('client_secret', process.env.SPOTIFY_CLIENT_SECRET);

    const tokenRes = await axios.post('https://accounts.spotify.com/api/token', params.toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    if (tokenRes.status !== 200) {
        throw new Error("Failed to get access token from Spotify");
    }

    return tokenRes.data;
});

const saveAcessTokenIfNeeded = asyncHandler(async(userId) => {
    const spotifyUserQuery = await pool.query(
            "SELECT * FROM users_spotify WHERE user_id = $1",
            [userId]
    );
    if (spotifyUserQuery.rows.length === 0) {
        throw new Error("User not found in the database");
    }
    const spotifyUser = spotifyUserQuery.rows[0];
    if (spotifyUser.expires_at < new Date()) {
        try {
            const tokenRes = await reqAccessToken('refresh_token', spotifyUser.refresh_token);
            const expiresIn = tokenRes.expires_in;
            const newExpiresAt = new Date(Date.now() + expiresIn * 1000);
            const refreshToken = tokenRes.refresh_token || spotifyUser.refresh_token;
            await pool.query(
                "UPDATE users_spotify SET access_token = $1, refresh_token = $2, expires_at = $3 WHERE user_id = $4",
                [tokenRes.access_token, refreshToken, newExpiresAt, userId]
            );
            console.log("Access token refreshed and saved successfully");
        } catch (error) {
            console.error("Error refreshing access token:", error);
            throw new Error("Failed to refresh access token");
        }
    }
});

const getAccessTokenForServer = asyncHandler(async() => {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    const response = await axios.post('https://accounts.spotify.com/api/token', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
        }
    });

    if (response.status !== 200) {
        throw new Error("Failed to get access token for server from Spotify");
    }
    return response.data.access_token;
})

export { reqAccessToken, saveAcessTokenIfNeeded, getAccessTokenForServer };