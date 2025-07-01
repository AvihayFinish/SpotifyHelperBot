import OpenAI from "openai";
import dotenv from "dotenv";
import asyncHandler from "express-async-handler";
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const analyzeEpisode = asyncHandler(async(episode, userTopics) => {
    const systemPrompt = `
        You are a podcast content analyzer.
        Given the title and description of an episode, and a list of topics, return a JSON array of matching topics.
        If none match, return: []
        Do not return any explanation.
        Just pure JSON output.
        `;

    const userPrompt = `
        Episode Title: ${episode.title}
        Episode Description: ${episode.description}
        Topics: ${userTopics.join(", ")}
        `;

    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ]
    });

    const rawResponse = completion.choices[0].message.content;
    const cleanedResponse = rawResponse.replace(/```json|```/g, "").trim();

    return JSON.parse(cleanedResponse);
})

export { analyzeEpisode };