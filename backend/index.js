import express from 'express';
import dotenv from 'dotenv';
import { notFound, errorHandler } from './midllewares/errorMidlleware.js';
import botRouter from './routers/botRouter.js';
import cron from 'node-cron';
import { checkEpisodes } from './jobs/checkCorresTopicEpisode.js';

dotenv.config();
const port = process.env.PORT || 8000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/spotifyHelper/bot', botRouter);

cron.schedule("0 14 * * *", async () => {
  console.log("🔄 Running scheduled podcast check...");
  try {
    await checkEpisodes();
    console.log(`Podcast check done at ${new Date().toLocaleString()}`);
  } catch (err) {
    console.error("Error in scheduled check:", err.message);
  }
});

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});