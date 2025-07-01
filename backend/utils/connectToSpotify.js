import dotenv from "dotenv";
import asyncHandler from "express-async-handler";

dotenv.config();

const buildLink = asyncHandler(async (from) => {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
    const state = from;
    const scope = "user-read-private user-read-email user-library-read user-top-read playlist-read-private user-library-modify";

    const params = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        state: state,
        scope: scope
    });

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
    return authUrl;
});

export { buildLink };