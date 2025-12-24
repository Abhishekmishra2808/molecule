
import * as pdfjsLib from 'pdfjs-dist';

// Use cdnjs for the worker to ensure a classic script is served.
// esm.run provides ESM modules which fail with "importScripts" in standard workers 
// due to cross-origin module loading restrictions.
const WORKER_SRC = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// Helper to initialize worker settings robustly
const initWorker = () => {
  try {
    // Check both standard import and default export for compatibility
    // @ts-ignore
    const lib = pdfjsLib.default || pdfjsLib;
    
    if (lib && lib.GlobalWorkerOptions) {
      lib.GlobalWorkerOptions.workerSrc = WORKER_SRC;
    }
  } catch (e) {
    console.warn("Failed to set PDF worker source", e);
  }
};

// Initialize on module load
initWorker();

export const readFileContent = async (file: File): Promise<string> => {
  if (file.type === 'application/pdf') {
    return readPdf(file);
  } else {
    return readText(file);
  }
};

const readText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

const readPdf = async (file: File): Promise<string> => {
  try {
    // Ensure worker is set before processing
    initWorker();
    
    const arrayBuffer = await file.arrayBuffer();
    
    // Access library instance safely
    // @ts-ignore
    const lib = pdfjsLib.default || pdfjsLib;

    if (!lib || !lib.getDocument) {
        throw new Error("PDF.js library not loaded correctly");
    }

    // Convert ArrayBuffer to Uint8Array for stability
    const loadingTask = lib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    const maxPages = Math.min(pdf.numPages, 15); 
    
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        // @ts-ignore
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += `[Page ${i}] ${pageText}\n`;
    }
    
    if (pdf.numPages > maxPages) {
        fullText += `\n... [Truncated ${pdf.numPages - maxPages} remaining pages]`;
    }
    
    return fullText;
  } catch (error: any) {
    console.error("PDF Parse Error:", error);
    // Return a clear error for the UI to display
    throw new Error(`Failed to parse PDF: ${error?.message || "Unknown error"}. Please ensure the file is a valid, unprotected PDF.`);
  }
};
