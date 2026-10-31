import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import errorHandler from "./middlewares/errorHandler.js";
const PORT = process.env.PORT || 5000;

const app = express();


// Routes
import authRoutes from "./routers/authRoutes.js";
import documentRouter from "./routers/documentRouter.js";
import FlashcardRouter from "./routers/flashcardsRouter.js";


// ES6 __dirname alternative
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// ====================
// General Middlewares
// ====================

app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));


// ====================
// Static Files
// ====================

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ====================
// Routes
// ====================

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRouter);
app.use("/api/flashcard",FlashcardRouter)

// ====================
// 404 Error
// ====================

app.use((req, res, next) => {
  res.status(404).json({
    successful: false,
    error: "Route not found",
    statuscode: 404,
  });
});


// ====================
// Global Error Handler
// ====================

app.use(errorHandler);


// ====================
// Start Server
// ====================

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} 
    http://localhost:${PORT}`);
  });
}

startServer();


// ====================
// Unhandled Rejection
// ====================

process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);

  process.exit(1);
});