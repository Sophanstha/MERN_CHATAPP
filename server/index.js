import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectedDb from "./Db/dbConnection.js";
import UserRouter from "./routes/userRouter.js";
import multer from "multer";
import cookieParser from "cookie-parser";
import { app, server } from "./socket/index.js"; 
import AdminRouter from "./routes/AdminRoutes.js";

// Initialize dotenv
dotenv.config();

// Initialize express
// const app = express();

// ✅ Move `cookieParser()` before `cors()`
app.use(cookieParser());

// ✅ CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173","http://localhost:5174"],
    credentials: true, // Allow cookies
  })
);

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
// ✅ Set Port
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
