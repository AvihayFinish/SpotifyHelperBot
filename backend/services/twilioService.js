import twilio from "twilio";
import asyncHandler from "express-async-handler";
import dotenv from 'dotenv';
import { buildMainMenu } from "../utils/messageBuilder.js";
import { updateUserStep } from "./userService.js";
dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// This function sends a message using Twilio's API
// It takes a phone number and a message body as parameters
const sendMsgTwilio = asyncHandler(async (to, body) => {
    try {
        const message = await client.messages.create({
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to,
            body: body
        });
        return message;
    } catch (error) {
        console.error("Error sending message via Twilio:", error);
        throw new Error("Failed to send message via Twilio");
    }
});

// This function builds the main menu message and sends it to the user
// It also updates the user's step in the database to 'awaiting_main_menu_selection'
const mainMenu = asyncHandler(async (to) => {
    const menuText = buildMainMenu();

    await client.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to,
        body: menuText
    });

    await updateUserStep(to, 'awaiting_main_menu_selection');
});

// This function lists podcasts to the user
// It takes a phone number, an array of podcasts, and a message as parameters
const listOfPodcasts = asyncHandler(async(to, podcasts, msg) => {
    await client.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to,
        body: `${msg}\n${podcasts.map((p, i) => `*${i + 1}*- *${p.name}*,\n ${p.publisher}\n`).join('\n')}`
    })
});

export { sendMsgTwilio, mainMenu, listOfPodcasts };