import { getLastFiveEpisodes } from "../services/dataFromSpotifyService.js";
import { getAccessTokenForServer } from "../services/spotifyAuthService.js";
import { sendMsgTwilio } from "../services/twilioService.js";
import { getPodAndFollowers, updateLastChecked } from "../services/podService.js";
import { getTopicsPerUser } from "../services/userTopicsService.js";
import { analyzeEpisode } from "../utils/AIHelper.js";
import { generateNewEpisodeMessage } from "../utils/messageBuilder.js";

export async function checkEpisodes () {
    const podcastsAndFollowers = await getPodAndFollowers(); 
    const topicsPerUser = await getTopicsPerUser();
    const allTopics = [
        ...new Set(
        topicsPerUser.flatMap(user => Array.isArray(user.topics) ? user.topics : [])
        )
    ];
    const accessTokenForServer = await getAccessTokenForServer();
    for (const podcast of podcastsAndFollowers) {
        const episodes = await getLastFiveEpisodes(accessTokenForServer, podcast.podcast_id);
        if (episodes.length === 0) {
            throw new Error(`No episodes found for podcast ID: ${podcast.podcast_id}`);
        }

        for (const episode of episodes) {
            if (new Date(episode.release_date) <= new Date(podcast.last_checked)) {
                continue;
            }

            const episodeTopics = await analyzeEpisode(episode, allTopics);
            if (episodeTopics.length === 0) {
                continue; // Skip if no topics match
            }
            for (const user of podcast.users) {
                const userID = user.user_id;
                const userPhoneNumber = user.phone_number;
                const userTopics = topicsPerUser.find(user => user.user_id === userID);
                if (!userTopics) {
                    continue; // Skip if no topics found for the user
                }
                const matchingTopics = episodeTopics.filter(topic => userTopics.topics.includes(topic));
                if (matchingTopics.length > 0) {
                    const messageBody = generateNewEpisodeMessage(podcast, episode, matchingTopics);
                    await sendMsgTwilio(userPhoneNumber, messageBody);
                }
            }
        }

        await updateLastChecked(podcast.podcast_id, new Date());
    }
};