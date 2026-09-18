import fs from "fs/promises";
import {PDFParser} from "pdf-parse";

// Export a function to parse PDF files
export const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    // pdf-parse expects a Unit8Array, so we convert the Buffer to Uint8Array
    const parser = new PDFParser(new Uint8Array(dataBuffer));
    const data = await parser.parse();
    // Return the extracted text from the PDF
    return {
        text: data.text, // Extracted text from the PDF
        numPages: data.numpages, // Number of pages in the PDF
        info: data.info, // Metadata information about the PDF
    }; 
  } catch (error) {
    console.error(`Error parsing PDF: ${error.message}`);
    throw new Error(`Error parsing PDF: ${error.message}`);
  }
};