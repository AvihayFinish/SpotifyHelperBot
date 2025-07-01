import axios from "axios";
import asyncHandler from "express-async-handler";
import { serializePodcastResult, serializeEpisodesResult, serializedArtistsResult } from "../utils/serializeItems.js";

const getListOfFivePodcasts = asyncHandler(async (accessToken, query, typeObject) => {
    const response = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        params: {
            q: query,
            type: typeObject,
            limit: 5,
        },
    });

    if (response.status !== 200) {
        throw new Error("Failed to fetch podcasts from Spotify");
    }

    const serializedItems = serializePodcastResult(response.data.shows.items); 
    return serializedItems;
});

const getLastFiveEpisodes = asyncHandler(async (accessToken, podcastID) => {
    const response = await axios.get(`https://api.spotify.com/v1/shows/${podcastID}/episodes`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        params: {
            limit: 5,
        },
    });

    if (response.status !== 200) {
        throw new Error("Failed to fetch podcast episodes from Spotify");
    }

    const serializedEpisodes = serializeEpisodesResult(response.data.items);
    return serializedEpisodes;
});

const mostFivePopularArtistsPerUser = asyncHandler(async (accessToken) => {
    try {
        const response = await axios.get(`https://api.spotify.com/v1/me/top/artists`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                limit: 5,
                time_range: 'medium_term',
            },
        });

        const items = response.data.items;
        if (!items || !Array.isArray(items)) {
            throw new Error("Unexpected response format from Spotify");
        }

        return serializedArtistsResult(items);
    } catch (error) {
        console.error("Error fetching top podcasts:", error);
        throw new Error("Failed to fetch user's top podcasts from Spotify");
    }
});


export { getListOfFivePodcasts, getLastFiveEpisodes, mostFivePopularArtistsPerUser };