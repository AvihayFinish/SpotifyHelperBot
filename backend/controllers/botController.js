import twilio from "twilio";
import asyncHandler from "express-async-handler";
import pool from "../config/db.js";
import { registerNewUser,
        getUserByPhoneNumber,
        updateUserStep,
        deleteUser,
        updateUserSearchResults,
        getUserSearchResults } from "../services/userService.js";
import { sendMsgTwilio, mainMenu, listOfPodcasts } from "../services/twilioService.js";
import { getUserPodcasts, searchUserPodcasts, addUserPodcast, removeUserPodcast, checkIfUserFollowPodcastById } from "../services/userPodcastService.js";
import { getUserTopics, addUserTopic, removeUserTopic, checkIfUserHasTopic } from "../services/userTopicsService.js";
import { getUserAccessTokenFromDB, updateTokensInDB } from "../services/userSpotifyService.js";
import { reqAccessToken, saveAcessTokenIfNeeded, getAccessTokenForServer } from "../services/spotifyAuthService.js";
import { getListOfFivePodcasts, mostFivePopularArtistsPerUser } from "../services/dataFromSpotifyService.js";
import { getTopicByName, addTopic, getTopicIdByName, removeTopic } from "../services/topicService.js";
import { addPodcast, removePodcast } from "../services/podService.js";
import { buildLink } from "../utils/connectToSpotify.js";
import { generateWelcomeMessage,
        generateProblemAuthMessage,
        generatePodcastListMessage,
        generateTopicsListMessage,
        generateTopArtistsMessage,
        generateHelpMessage,
        generateRemovePodcastListMessage } from "../utils/messageBuilder.js";


// @desc    Manage incoming messages from Twilio
// @route   POST /spotifyHelper/webhook
// @access  Public
const manageMessages = asyncHandler(async (req, res) => {
    const msgBody = req.body.Body?.trim().toLowerCase();
    const from = req.body.From;
    const twiml = new twilio.twiml.MessagingResponse();
    const user = await getUserByPhoneNumber(from);

    if (!user) {
        await registerNewUser(from);
        // Generate the Spotify authorization link
        const authLink = await buildLink(from);
        let msg = generateWelcomeMessage(authLink)
        twiml.message(msg);
        res.set('Content-Type', 'text/xml');
        res.status(200).send(twiml.toString());
        return
    } else if (user.step === 'awaiting_credentials') {
        const authLink = await buildLink(from);
        let msg = generateProblemAuthMessage(authLink);
        twiml.message(msg);
        res.set('Content-Type', 'text/xml');
        res.status(200).send(twiml.toString());
        return;
    } else if (msgBody === 'עזרה') {
        await mainMenu(from);
    } else if (user.step === 'awaiting_main_menu_selection') {
        switch (msgBody) {
            case '1':
                // Ask the user for the podcast name they want to add
                twiml.message("שלח לי את שם הפודקסט שברצונך להוסיף למעקב.");
                await updateUserStep(from, 'awaiting_podcast_name');
                res.set('Content-Type', 'text/xml');
                res.status(200).send(twiml.toString());
                break;
            case '2':
                // Ask the user for the podcast name they want to remove
                twiml.message("שלח לי את שם הפודקסט שברצונך להסיר ממעקב.");
                await updateUserStep(from, 'awaiting_remove_podcast_name');
                res.set('Content-Type', 'text/xml');
                res.status(200).send(twiml.toString());
                break;
            case '3':
                // Ask the user for the topic name they want to add
                twiml.message("שלח לי את הנושא שברצונך להוסיף למעקב.");
                await updateUserStep(from, 'awaiting_topic_name');
                res.set('Content-Type', 'text/xml');
                res.status(200).send(twiml.toString());
                break;
            case '4':
                // Ask the user for the topic name they want to remove
                twiml.message("שלח לי את הנושא שברצונך להסיר ממעקב.");
                await updateUserStep(from, 'awaiting_remove_topic_name');
                res.set('Content-Type', 'text/xml');
                res.status(200).send(twiml.toString());
                break;
            case '5': {
                // Get the podcasts the user is following
                const podcasts = await getUserPodcasts(user.id);
                const msg = generatePodcastListMessage(podcasts);
                twiml.message(msg);
                res.set('Content-Type', 'text/xml');
                res.status(200).send(twiml.toString());

                await mainMenu(from);
                break;
            }
            case '6': {
                // Get the topics the user is following
                const topics = await getUserTopics(user.id);
                let msg = generateTopicsListMessage(topics);
                twiml.message(msg);
                res.set('Content-Type', 'text/xml');
                res.status(200).send(twiml.toString());
                
                await mainMenu(from);
                break;
            }
            case '7': {
                // Send to user the 5 most popular podcasts they listen to
                try {
                    console.log("Refreshing access token if needed for user:", user.id);
                    await saveAcessTokenIfNeeded(user.id);
                } catch (error) {
                    console.error("Error refreshing access token:", error);
                    twiml.message("הייתה בעיה בשימוש בטוקן שלך. אנא נסה שנית.");
                    res.set('Content-Type', 'text/xml');
                    res.status(200).send(twiml.toString());
                    return;
                }
                console.log("Fetching most popular podcasts for user:", user.id);

                const spotifyUserAccessToken = await getUserAccessTokenFromDB(user.id);
                console.log("Spotify user access token:");
                const podcasts = await mostFivePopularArtistsPerUser(spotifyUserAccessToken);
                console.log("Fetched podcasts:", podcasts);
                let msg = generateTopArtistsMessage(podcasts);
                twiml.message(msg);
                res.set('Content-Type', 'text/xml');
                res.status(200).send(twiml.toString());

                await mainMenu(from);
                break;
            }
            case '8':
                // Delete the user from the database
                await deleteUser(user.id);
                twiml.message("המשתמש נמחק בהצלחה. אם תרצה לחזור, פשוט שלח לי הודעה חדשה.");
                res.set('Content-Type', 'text/xml');
                res.status(200).send(twiml.toString());
                break;
            case '9':
                // Provide help message
                let msg = generateHelpMessage();
                twiml.message(msg);
                res.set('Content-Type', 'text/xml');
                res.status(200).send(twiml.toString());

                await mainMenu(from);
                break;
            default:
                twiml.message("לא הבנתי את הבחירה שלך. אנא שלח מספר בין 1 ל-9.");
                res.set('Content-Type', 'text/xml');
                res.status(200).send(twiml.toString());
                break;
        }
    } else if (user.step === 'awaiting_podcast_name') {
        const podcastName = msgBody;
        try {
            const serverAccessToken = await getAccessTokenForServer();
            const podcasts = await getListOfFivePodcasts(serverAccessToken, podcastName, 'show');
            if (podcasts.length === 0) {
                twiml.message("לא מצאתי פודקסטים עם השם הזה. אנא נסה שוב עם שם אחר.");
                res.set('Content-Type', 'text/xml');
                res.status(200).send(twiml.toString());
            } else {
                const jsonPodcasts = JSON.stringify(podcasts);
                await updateUserSearchResults(user.id, jsonPodcasts);
                let msg = "אלו הפודקסטים שמצאתי שתואמים לחיפוש שלך, השב במספר איזה להוסיף:\n";
                listOfPodcasts(from, podcasts, msg);
                await updateUserStep(from, 'awaiting_podcast_selection');
            }
        } catch (error) {
            console.error("Error adding podcast:", error);
            twiml.message("הייתה בעיה במציאת הפודקסט. אנא נסה שוב מאוחר יותר.");
            res.set('Content-Type', 'text/xml');
            res.status(200).send(twiml.toString());
        }

    } else if (user.step === 'awaiting_remove_podcast_name') {
        const podcastName = msgBody;
        try {
            const podcasts = await searchUserPodcasts(user.id, podcastName);
            if (podcasts.length === 0) {
                twiml.message("לא מצאתי פודקסטים עם השם הזה במעקב שלך. אנא נסה שוב עם שם אחר.");
                res.set('Content-Type', 'text/xml');
                res.status(200).send(twiml.toString());
                return;
            }
            
            // If podcasts found, send the list to the user
            let msg = generateRemovePodcastListMessage(podcasts);
            await updateUserSearchResults(user.id, JSON.stringify(podcasts));
            twiml.message(msg);
            res.set('Content-Type', 'text/xml');
            res.status(200).send(twiml.toString());
            await updateUserStep(from, 'awaiting_remove_podcast_selection');
        } catch (error) {
            console.error("Error removing podcast:", error);
            twiml.message("הייתה בעיה בהסרת הפודקסט. אנא נסה שוב מאוחר יותר.");
            res.set('Content-Type', 'text/xml');
            res.status(200).send(twiml.toString());
        }

    } else if (user.step === 'awaiting_topic_name') {
        const topicName = msgBody;
        try {
            // Check if the topic already exists for the user
            const topic = await getTopicByName(topicName);
            if (topic !== null) {
                if (await checkIfUserHasTopic(user.id, topic.id)) {
                    twiml.message("נושא זה כבר קיים במעקב שלך. אנא נסה נושא אחר.");
                    res.set('Content-Type', 'text/xml');
                    res.status(200).send(twiml.toString());
                    return;
                } else {
                    // Insert the new topic into the user_topics table
                    await addUserTopic(user.id, topic.id);
                    twiml.message(`הנושא "${topicName}" נוסף למעקב שלך.`);
                    await mainMenu(from);
                    res.set('Content-Type', 'text/xml');
                    res.status(200).send(twiml.toString());
                    return;
                }
            } else {

                // Insert the new topic into the database
                await addTopic(topicName);
                // Get the newly created topic's ID
                const topicId = await getTopicIdByName(topicName);
                if (topicId === null) {
                    twiml.message("הייתה בעיה בהוספת הנושא. אנא נסה שוב מאוחר יותר.");
                    res.set('Content-Type', 'text/xml');
                    res.status(200).send(twiml.toString());
                    return;
                }
                await addUserTopic(user.id, topicId);
                twiml.message(`הנושא "${topicName}" נוסף למעקב שלך.`);
                res.set('Content-Type', 'text/xml');
                res.status(200).send(twiml.toString());
                await mainMenu(from);
            }
        } catch (error) {
            console.error("Error adding topic:", error);
            twiml.message("הייתה בעיה בהוספת הנושא. אנא נסה שוב מאוחר יותר.");
            res.set('Content-Type', 'text/xml');
            res.status(200).send(twiml.toString());
        }
    } else if (user.step === 'awaiting_remove_topic_name') {
        const topicName = msgBody;
        try {
            // Check if the topic exists for the user
            const topic = await getTopicByName(topicName);
            if (topic === null) {
                twiml.message("לא מצאתי נושא עם השם הזה במעקב שלך. אנא וודא שאתה כותב את השם כמו שהכנסת אותו.");
                res.set('Content-Type', 'text/xml');
                res.status(200).send(twiml.toString());
                return;
            }

            // Delete the topic from the database
            await removeTopic(topic.id);
            await removeUserTopic(user.id, topic.id);
            twiml.message(`הנושא "${topicName}" הוסר מהמעקב שלך.`);
            res.set('Content-Type', 'text/xml');
            res.status(200).send(twiml.toString());
            await mainMenu(from);
        } catch (error) {
            console.error("Error removing topic:", error);
            twiml.message("הייתה בעיה בהסרת הנושא. אנא נסה שוב מאוחר יותר.");
            res.set('Content-Type', 'text/xml');
            res.status(200).send(twiml.toString());
        }
    } else if (user.step === 'awaiting_podcast_selection') {
        const podcastIndex = parseInt(msgBody) - 1;
        if (isNaN(podcastIndex) || podcastIndex < 0 || podcastIndex >= 5) {
            twiml.message("מספר לא תקין. אנא שלח מספר בין 1 ל-5.");
            res.set('Content-Type', 'text/xml');
            res.status(200).send(twiml.toString());
            return;
        }
        
        const podcasts = await getUserSearchResults(user.id);
        if (podcasts === null || podcasts.length === 0 || podcastIndex > podcasts.length) {
            twiml.message("לא נמצאו פודקסטים עם השם הזה. אנא נסה שוב עם שם אחר או עם מספר תקין.");
            res.set('Content-Type', 'text/xml');
            res.status(200).send(twiml.toString());
            return;
        }
        const selectedPodcast = podcasts[podcastIndex];
        try {
            // Check if the podcast already exists for the user
            if (await checkIfUserFollowPodcastById(user.id, selectedPodcast.id)) {
                twiml.message("פודקסט זה כבר קיים במעקב שלך. אנא נסה פודקסט אחר.");
                res.set('Content-Type', 'text/xml');
                res.status(200).send(twiml.toString());
                return;
            }

            // Insert the new podcast into the database and link it to the user
            await addPodcast(selectedPodcast);
            await addUserPodcast(user.id, selectedPodcast.id);

            twiml.message(`הפודקסט "${selectedPodcast.name}" נוסף למעקב שלך.`);
            res.set('Content-Type', 'text/xml');
            res.status(200).send(twiml.toString());
            await mainMenu(from);
        } catch (error) {
            console.error("Error adding podcast:", error);
            twiml.message("הייתה בעיה בהוספת הפודקסט. אנא נסה שוב מאוחר יותר.");
            res.set('Content-Type', 'text/xml');
            res.status(200).send(twiml.toString());
        }
    } else if (user.step === 'awaiting_remove_podcast_selection') {
        const podcastIndex = parseInt(msgBody) - 1;
        if (isNaN(podcastIndex) || podcastIndex < 0) {
            twiml.message("מספר לא תקין. אנא שלח מספר תקין.");
            res.set('Content-Type', 'text/xml');
            res.status(200).send(twiml.toString());
            return;
        }

        const podcasts = await getUserSearchResults(user.id);
        if (podcasts === null || podcasts.length === 0 || podcastIndex > podcasts.length) {
            twiml.message("לא נמצאו פודקסטים עם המספר הזה. אנא נסה שוב עם מספר תקין.");
            res.set('Content-Type', 'text/xml');
            res.status(200).send(twiml.toString());
            return;
        }

        const selectedPodcast = podcasts[podcastIndex];
        try {
            // Delete the podcast from the database and unlink it from the user
            await removeUserPodcast(user.id, selectedPodcast.id);
            await removePodcast(selectedPodcast.id);

            twiml.message(`הפודקסט "${selectedPodcast.title}" הוסר מהמעקב שלך.`);
            res.set('Content-Type', 'text/xml');
            res.status(200).send(twiml.toString());
            await mainMenu(from);
        } catch (error) {
            console.error("Error removing podcast:", error);
            twiml.message("הייתה בעיה בהסרת הפודקסט. אנא נסה שוב מאוחר יותר.");
            res.set('Content-Type', 'text/xml');
            res.status(200).send(twiml.toString());
        }
    }
});

// @desc    Get access token from Spotify
// @route   GET /spotifyHelper/callback
// @access  Public
const getAccessToken = asyncHandler(async (req, res) => {
    const { code, state } = req.query;

    const tokenRes = await reqAccessToken('authorization_code', code);

    const accessToken = tokenRes.access_token;
    const refreshToken = tokenRes.refresh_token;
    const expiresIn = tokenRes.expires_in;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresIn * 1000);
    
    const user = await getUserByPhoneNumber(state);
    if (!user) {
        res.status(404).send("User not found");
        return;
    }

    // Update user with access token and refresh token
    try {
        await updateTokensInDB(user.id, accessToken, refreshToken, expiresAt);
    } catch (error) {
        console.error("Error updating user with access token:", error);
        res.status(500).send("Error updating user with access token");
        return;       
    }

    let msg = "התחברת בהצלחה לספוטיפיי! 🎉.";
    // Respond with a success message
    await sendMsgTwilio(state, msg);
    await mainMenu(state);

    res.status(200).send("אתה יכול לחזור לצאט בוואצאפ");
});

export { manageMessages, getAccessToken };