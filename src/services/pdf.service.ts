import fs from "fs";
import pdf from "pdf-parse";
export async function readPdfText(filePath: string) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text.trim();
  } catch (error) {
    return null;
  }
}
