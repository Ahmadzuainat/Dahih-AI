import Document from "../models/documentModel.js";
import Flashcard from "../models/flashcardsModel.js";
import Quiz from "../models/quizModel.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import fs from "fs/promises";

const PORT = process.env.PORT || 5000;

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded", statuscode: 400 });
    } else if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ success: false, error: "Only PDF files are allowed", statuscode: 400 });
    }
    const { title } = req.body;
    if (!title) {
      await fs.unlink(req.file.path); // Delete the uploaded file if title is missing
      return res.status(400).json({ success: false, error: "Title is required", statuscode: 400 });
    }

    // construct the url for the uploaded file
    const baserURL = `http://localhost:${PORT}`;
    const fileURL = `${baserURL}/uploads/documents/${req.file.filename}`;

    // create document record in the database
    const document = await Document.create({
      userId: req.user._id,
      title: title,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      status: "processing",
    });

    // Process the pdf background (in production , use queue system like Bull )
    processPDF(document._id, req.file.path).catch((error) => {
      console.error(`Error processing PDF: ${error.message}`);
    });

    res.status(201).json({ success: true, message: "Document uploaded successfully . processing in progress", data: document, statuscode: 201 });
  } catch (error) {
    if (req.file) {
      // Delete the uploaded file if an error occurs
      await fs.unlink(req.file.path);
    }
    next(error); // Pass the error to the global error handler
  }
};

//helper Function to process the PDf
const processPDF = async (documentId, filePath) => {
  try {
    // Extract text from the PDF
    const { text } = await extractTextFromPDF(filePath);
    // create chunks
    const chunks = chunkText(text, 500, 50);
    // update document
    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks: chunks,
      status: 'ready'
    });
    console.log(`Document ${documentId} processed succesfully`);
  } catch (error) {
    console.error(`error processing document ${documentId} `, error);
    await Document.findByIdAndUpdate(documentId, {
      status: 'failed'
    });
  }
};

export const getAllDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ userId: req.user._id });
    res.status(200).json(documents);
  } catch (error) {
    next(error); // Pass the error to the global error handler
  }
};

export const getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404
      });
    }

    // Get count of associated flashcard and quizzes
    const flashcardCount = await Flashcard.countDocuments({ documentId: document._id, userId: req.user._id });
    const quizCount = await Quiz.countDocuments({ documentId: document._id, userId: req.user._id });

    // update last accessed
    document.lastAccessed = Date.now();
    await document.save();

    // Combine document data with counts
    const documentData = document.toObject();
    documentData.flashcardCount = flashcardCount;
    documentData.quizCount = quizCount;

    res.status(200).json({
      success: true,
      data: documentData
    });
  } catch (error) {
    next(error); // Pass the error to the global error handler
  }
};

// @access Private
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
        statusCode: 404
      });
    }

    // Delete file from filesystem
    await fs.unlink(document.filePath).catch(() => {});

    // Delete document
    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
