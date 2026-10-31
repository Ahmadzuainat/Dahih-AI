import express from "express";
import upload from "../config/multer.js";
import {
    uploadDocument,
    getAllDocuments,
    getDocumentById,
    deleteDocument
} from "../Controllers/documentController.js";

import protect from "../middlewares/auth.js";
const router = express.Router();

// Routes for document management
router.post("/upload", protect, upload.single('file'), uploadDocument);
router.get("/", protect, getAllDocuments);
router.get("/:id", protect, getDocumentById);
router.delete("/:id", protect, deleteDocument);

export default router;
