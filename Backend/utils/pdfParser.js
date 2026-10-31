import fs from "fs/promises";
import { PDFParse } from "pdf-parse";

// Export a function to parse PDF files
export const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);
    // pdf-parse expects a Uint8Array
    const parser = new PDFParse(new Uint8Array(dataBuffer));
    const result = await parser.getText();
    const info = await parser.getInfo();

    // Return the extracted text from the PDF
    return {
      text: result.text || "", // Extracted text from the PDF
      numPages: result.total || 0, // Number of pages in the PDF
      info: info ? info.info : {}, // Metadata information about the PDF
    };
  } catch (error) {
    console.error(`Error parsing PDF: ${error.message}`);
    throw new Error(`Error parsing PDF: ${error.message}`);
  }
};
