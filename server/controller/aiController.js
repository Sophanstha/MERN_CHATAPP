import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getUserDetailFromToken } from "../helper/getUserDetailFromToken.js";
import AiConversation from "../models/aiConversation.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

// Helper to authenticate user from cookie or authorization header
const authenticateUser = async (req) => {
  const token =
    req.cookies?.token ||
    req.headers?.authorization?.replace("Bearer ", "") ||
    "";
  const user = await getUserDetailFromToken(token);
  if (!user || user.logout || user.status === false) {
    return null;
  }
  return user;
};

// Check if a valid API key is present
const getCleanApiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim() === "" || key.trim() === "your_gemini_api_key_here") {
    return null;
  }
  return key.trim();
};

/**
 * Send a message to Gemini AI and get a response
 */
export const sendAiMessage = async (req, res) => {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in again.",
        logout: true,
      });
    }

    const { message: userText } = req.body;
    if (!userText || typeof userText !== "string" || !userText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text is required.",
      });
    }

    const apiKey = getCleanApiKey();
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        isKeyMissing: true,
        message:
          "Gemini API key is not configured. Please add GEMINI_API_KEY in server/.env or configure it in the AI Chat settings.",
      });
    }

    // Find or create AI conversation for this user
    let conversation = await AiConversation.findOne({ userId: user._id });
    if (!conversation) {
      conversation = new AiConversation({
        userId: user._id,
        messages: [],
      });
    }

    // Build context history for Gemini (last 16 messages for multi-turn conversational context)
    const recentHistory = conversation.messages.slice(-16).map((m) => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: m.text }],
    }));

    // Add current user prompt
    recentHistory.push({
      role: "user",
      parts: [{ text: userText.trim() }],
    });

    // Initialize GoogleGenAI SDK
    const ai = new GoogleGenAI({ apiKey });

    // Model candidates with graceful fallback
    const candidateModels = [
      process.env.GEMINI_MODEL || "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ];

    let replyText = "";
    let lastError = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: recentHistory,
          config: {
            systemInstruction:
              "You are Gemini AI, a helpful, intelligent, and friendly AI assistant built into ChatApp. You assist users with programming, writing, answering questions, brainstorming, and everyday queries. Provide well-structured answers using clean Markdown with code blocks, lists, and formatting where helpful.",
          },
        });

        if (response && response.text) {
          replyText = response.text;
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`Attempt with model ${modelName} failed:`, err?.message || err);
      }
    }

    if (!replyText) {
      console.error("Gemini AI generation error:", lastError);
      return res.status(500).json({
        success: false,
        message:
          lastError?.message ||
          "Failed to get response from Gemini AI. Please check your API key and try again.",
      });
    }

    // Append user query and AI response to history
    conversation.messages.push({
      role: "user",
      text: userText.trim(),
    });
    conversation.messages.push({
      role: "model",
      text: replyText,
    });

    await conversation.save();

    const savedUserMsg =
      conversation.messages[conversation.messages.length - 2];
    const savedModelMsg =
      conversation.messages[conversation.messages.length - 1];

    return res.status(200).json({
      success: true,
      userMessage: savedUserMsg,
      modelMessage: savedModelMsg,
    });
  } catch (error) {
    console.error("Error in sendAiMessage:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal server error while processing AI message.",
    });
  }
};

/**
 * Get AI conversation history for logged-in user
 */
export const getAiHistory = async (req, res) => {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
        logout: true,
      });
    }

    const conversation = await AiConversation.findOne({ userId: user._id });
    const apiKey = getCleanApiKey();

    return res.status(200).json({
      success: true,
      data: conversation?.messages || [],
      isConfigured: Boolean(apiKey),
    });
  } catch (error) {
    console.error("Error in getAiHistory:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch AI history.",
    });
  }
};

/**
 * Clear AI conversation history for user
 */
export const clearAiHistory = async (req, res) => {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
        logout: true,
      });
    }

    await AiConversation.findOneAndUpdate(
      { userId: user._id },
      { $set: { messages: [] } }
    );

    return res.status(200).json({
      success: true,
      message: "AI conversation history cleared successfully.",
    });
  } catch (error) {
    console.error("Error in clearAiHistory:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to clear AI history.",
    });
  }
};

/**
 * Get Gemini configuration status
 */
export const getAiStatus = async (req, res) => {
  try {
    const apiKey = getCleanApiKey();
    return res.status(200).json({
      success: true,
      isConfigured: Boolean(apiKey),
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to check AI status.",
    });
  }
};

/**
 * Save Gemini API Key directly to .env
 */
export const saveGeminiApiKey = async (req, res) => {
  try {
    const user = await authenticateUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const { apiKey } = req.body;
    if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
      return res.status(400).json({
        success: false,
        message: "Valid API key is required.",
      });
    }

    const trimmedKey = apiKey.trim();

    // Quick verification of the key with Gemini API
    try {
      const testAi = new GoogleGenAI({ apiKey: trimmedKey });
      await testAi.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Hello",
      });
    } catch (testErr) {
      // If error is invalid API key, return friendly message
      if (
        testErr?.message?.includes("API_KEY_INVALID") ||
        testErr?.message?.includes("403") ||
        testErr?.message?.includes("API key not valid")
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Gemini API key. Please check the key from Google AI Studio.",
        });
      }
    }

    // Update in-memory env
    process.env.GEMINI_API_KEY = trimmedKey;

    // Update or append to server/.env file
    try {
      let content = "";
      if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, "utf-8");
      }

      if (content.includes("GEMINI_API_KEY=")) {
        content = content.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${trimmedKey}`);
      } else {
        content += `\nGEMINI_API_KEY=${trimmedKey}\n`;
      }

      fs.writeFileSync(envPath, content, "utf-8");
    } catch (fsErr) {
      console.warn("Could not write to .env file:", fsErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Gemini API key configured and verified successfully!",
    });
  } catch (error) {
    console.error("Error in saveGeminiApiKey:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to save API key.",
    });
  }
};
