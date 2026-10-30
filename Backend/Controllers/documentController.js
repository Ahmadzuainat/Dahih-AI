import Document from "../models/documentModel.js";
import Flashcard from "../models/flashcardsModel.js";
import Quiz from "../models/quizModel.js";
import {extractTextFromPDF} from "../utils/pdfparser.js";
import {chunkText} from "../utils/textChunker.js";
import fs from "fs/promises";
const PORT = process.env.PORT || 5000;

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success:false, error: "No file uploaded" ,statuscode: 400});
    }else if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ success:false, error: "Only PDF files are allowed" ,statuscode: 400});
    }
    const {title} = req.body;
    if (!title) {
        await fs.unlink(req.file.path); // Delete the uploaded file if title is missing
      return res.status(400).json({ success:false, error: "Title is required" ,statuscode: 400});
    }

    // construct the url for the uploaded file
    const baserURL = `http://localhost:${PORT}/uploads/`;
    fileURL = `${baserURL}/uploads/documents/${req.file.filename}`;

    // create document record in the database
    const document = new Document.create({
      userid: req.user.id,
      title: title,
      filename: req.file.originalname,
      fileURL: fileURL, 
      filesize: req.file.size,
      status: "Prosessing",
    });

    // Process the pdf background (in production , use queue system like Bull )
    ProcessPDF(document._id,req.file.path ).catch((error) => {
      console.error(`Error processing PDF: ${error.message}`);
    });
    
    res.status(201).json({ success:true, message: "Document uploaded successfully . processing in progress", data: document ,statuscode: 201});
}catch (error) {
     if(req.file) {
      // Delete the uploaded file if an error occurs
      await fs.unlink(req.file.path);
    }
    next(error); // Pass the error to the global error handler
  }
}


//helper Function to process the PDf
const processPDF = async (documentId, filePath) => {
  try {
    // Extract text from the PDF
    const { text } = await extractTextFromPDF(filePath);
    // create chunks
    const chunks = chunkText(text,500,50)
    // update document
    await Document.findByIdAndUpdate(document.id,{
        extractText:text,
        chunks:chunks,
        status:'ready'
    })
consoel.log(`Document ${documentId} processed succesfully`)

}catch(erorr){
    consoler.error(`error processing document ${documentId} `,error)
    await Document.findByIdAndUpdate(documentId,{
        states:`failed`
    })
}
}
export const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find();
    res.status(200).json(documents);

   
  }catch (error) {
    next(error); // Pass the error to the global error handler
  }
}

export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    res.status(200).json(document);
  }catch (error) {
    next(error); // Pass the error to the global error handler
  }

}

export const updateDocument = async (req, res) => {
  try {
    const updatedDocument = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true
    });
    if (!updatedDocument) {
      return res.status(404).json({ message: "Document not found" });
    }
    res.status(200).json(updatedDocument);
  }
    catch (error) {
    next(error); // Pass the error to the global error handler
    }
}

export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    await Document.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    next(error); // Pass the error to the global error handler
  }
}