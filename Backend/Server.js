import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5000;

import express from "express";
const app = express();
app.use(express.json());

import cors from "cors";
app.use(cors());

import path from "path";
import { fileURLToPath } from "url";


// ES6 module _dirname altrnative
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// connect to database
import connectDB from "./config/db.js";
import { error } from "console";

// import routes
import errorhandler from "./middlewares/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";


// middlewares to handle cors 
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
)


app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Routes
app.use(errorhandler);
app.use("/api/auth",authRoutes);


// 404 error handler
app.use((req, res, next) => {
  res.status(404).json({successful:false, error: "Route not found" ,statuscode:404});
});




































// Listen for server start
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();

process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});