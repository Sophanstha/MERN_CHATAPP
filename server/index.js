import "dotenv/config";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectedDb from "./Db/dbConnection.js";
import UserRouter from "./routes/userRouter.js";
import multer from "multer";
import cookieParser from "cookie-parser";
import { app, server, corsOptions } from "./socket/index.js"; 
import AdminRouter from "./routes/AdminRoutes.js";
import GroupRouter from "./routes/groupRoutes.js";
import AiRouter from "./routes/aiRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, "../client/dist");

// Initialize dotenv
dotenv.config();

// ✅ Move `cookieParser()` before `cors()`
app.use(cookieParser());

// ✅ Production-ready CORS configuration
app.use(cors(corsOptions));

// ✅ Multer setup for file uploads (keep before JSON middleware)
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "18kb" }));

// ✅ Connect to Database
connectedDb()
  .then(() => console.log("Connected to Database"))
  .catch((err) => console.error("Error connecting to Database:", err));

// ✅ Routes
app.use("/api/user", upload.single("file"), UserRouter);
app.use("/api/admin",upload.single("file"),AdminRouter);
app.use("/api/group", upload.single("file"), GroupRouter);
app.use("/api/ai", AiRouter);

// ✅ Healthcheck endpoint for deployment platforms
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date() });
});

// ✅ Serve built client in production (if deployed as single service)
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
      return next();
    }
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// ✅ Set Port
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
