import { Router } from "express";
import {
  sendAiMessage,
  getAiHistory,
  clearAiHistory,
  getAiStatus,
  saveGeminiApiKey,
} from "../controller/aiController.js";

const AiRouter = Router();

AiRouter.get("/history", getAiHistory);
AiRouter.post("/message", sendAiMessage);
AiRouter.delete("/history", clearAiHistory);
AiRouter.get("/status", getAiStatus);
AiRouter.post("/save-key", saveGeminiApiKey);

export default AiRouter;
