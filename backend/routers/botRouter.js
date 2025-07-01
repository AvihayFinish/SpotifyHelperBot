import express from "express";
import { manageMessages, getAccessToken } from "../controllers/botController.js";

const botRouter = express.Router();

botRouter.post("/", manageMessages);
botRouter.get("/callback", getAccessToken);

export default botRouter;