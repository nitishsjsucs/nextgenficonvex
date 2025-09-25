import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const pinecone = new Pinecone({ 
  apiKey: process.env.PINECONE_API_KEY!
});

const INDEX_NAME = 'nextgenfi-rag';

interface DocumentVector {
  id: string;
  values: number[];
  metadata: {
    content: string;
    source: string;
    hierarchy: string;
    filename: string;
    chunkIndex: number;
  };
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>, 
  maxRetries: number = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delayMs = Math.pow(2, i) * 1000;
        console.log(`⏳ Rate limited, waiting ${delayMs}ms before retry...`);
        await delay(delayMs);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

async function processOnePDF(
  filePath: string, 
  file: string, 
  hierarchy: string,
  index: any
): Promise<number> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
  
  try {
    console.log(`📄 Processing ${file}...`);
    
    // Check file size
    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    
    if (fileSizeInMB > 50) {
      console.warn(`⚠️  Skipping ${file} - too large (${fileSizeInMB.toFixed(1)}MB)`);
      return 0;
    }
    
    // Extract text from PDF
    const pdfBuffer = fs.readFileSync(filePath);
    const base64Data = pdfBuffer.toString('base64');
    
    const result = await retryWithBackoff(async () => {
      return await model.generateContent([
        {
          inlineData: {
            data: base64Data,
            mimeType: "application/pdf"
          }
        },
        "Extract all text content from this PDF document. Return only the text content without any formatting or commentary."
      ]);
    });
    
    const content = result.response.text();
    
    if (!content || content.length < 100) {
      console.warn(`  ⚠️  No content extracted from ${file}`);
      return 0;
    }
    
    // Chunk the document
    const chunks = chunkText(content, 2000, 300);
    console.log(`  📝 Created ${chunks.length} chunks for ${file}`);
    
    let uploadedCount = 0;
    
    // Process each chunk sequentially and upload instantly
    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const chunk = chunks[chunkIndex];
      
      try {
        // Generate embedding
        const embeddingResult = await retryWithBackoff(async () => {
          return await embedModel.embedContent(chunk);
        });
        
        const vector: DocumentVector = {
          id: `${hierarchy}-${file.replace('.pdf', '')}-${chunkIndex}`,
          values: embeddingResult.embedding.values,
          metadata: {
            content: chunk,
            source: filePath,
            hierarchy,
            filename: file,
            chunkIndex: chunkIndex
          }
        };
        
        // Upload instantly to Pinecone
        await retryWithBackoff(async () => {
          await index.upsert([vector]);
        });
        
        uploadedCount++;
        console.log(`    ✅ Uploaded chunk ${chunkIndex + 1}/${chunks.length} from ${file}`);
        
        // Small delay to be gentle on APIs
        await delay(300);
        
      } catch (error) {
        console.error(`    ❌ Failed chunk ${chunkIndex} of ${file}:`, error);
      }
    }
    
    console.log(`  ✅ Completed ${file}: ${uploadedCount}/${chunks.length} chunks uploaded`);
    return uploadedCount;
    
  } catch (error) {
    console.error(`❌ Failed to process ${file}:`, error);
    return 0;
  }
}

async function migrateDocuments() {
  console.log("🚀 Starting SEQUENTIAL migration (one PDF at a time)...");
  
  const startTime = Date.now();
  
  // Use existing index - no recreation needed
  const index = pinecone.index(INDEX_NAME);
  const docsPath = path.join(process.cwd(), "public", "docs");
  const docHierarchy = ["federal", "california", "sf-local"];
  
  // Collect all PDF files
  const allFiles: { filePath: string; file: string; hierarchy: string }[] = [];
  
  for (const hierarchy of docHierarchy) {
    const hierarchyPath = path.join(docsPath, hierarchy);
    
    if (!fs.existsSync(hierarchyPath)) {
      console.warn(`⚠️  Directory not found: ${hierarchyPath}`);
      continue;
    }

    const files = fs.readdirSync(hierarchyPath);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));
    
    console.log(`📁 Found ${pdfFiles.length} PDFs in ${hierarchy}/`);
    
    for (const file of pdfFiles) {
      allFiles.push({
        filePath: path.join(hierarchyPath, file),
        file,
        hierarchy
      });
    }
  }
  
  console.log(`📚 Processing ${allFiles.length} PDFs sequentially...`);
  
  let totalUploaded = 0;
  
  // Process each PDF one by one
  for (let i = 0; i < allFiles.length; i++) {
    const { filePath, file, hierarchy } = allFiles[i];
    
    console.log(`\n📄 Document ${i + 1}/${allFiles.length}: ${file}`);
    
    const uploaded = await processOnePDF(filePath, file, hierarchy, index);
    totalUploaded += uploaded;
    
    console.log(`  📊 Progress: ${i + 1}/${allFiles.length} documents, ${totalUploaded} total vectors`);
    
    // Small pause between documents
    if (i < allFiles.length - 1) {
      await delay(1000);
    }
  }
  
  const endTime = Date.now();
  const totalTime = (endTime - startTime) / 1000;
  
  console.log("\n🎉 Sequential Migration Complete!");
  console.log(`📊 Total vectors uploaded: ${totalUploaded}`);
  console.log(`⏱️  Total time: ${totalTime.toFixed(1)} seconds`);
  console.log(`📈 Average speed: ${(totalUploaded / totalTime).toFixed(1)} vectors/second`);
  
  // Test search
  if (totalUploaded > 0) {
    console.log("\n🔍 Testing search...");
    try {
      const testResults = await index.query({
        vector: new Array(768).fill(0.1),
        topK: 3,
        includeMetadata: true
      });
      console.log(`✅ Search test successful! Found ${testResults.matches.length} results`);
    } catch (error) {
      console.error("❌ Search test failed:", error);
    }
  }
}

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    let chunk = text.slice(start, end);
    
    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf('.');
      const lastNewline = chunk.lastIndexOf('\n');
      const breakPoint = Math.max(lastPeriod, lastNewline);
      
      if (breakPoint > start + chunkSize * 0.5) {
        chunk = text.slice(start, breakPoint + 1);
        start = breakPoint + 1 - overlap;
      } else {
        start = end - overlap;
      }
    } else {
      start = end;
    }
    
    chunks.push(chunk.trim());
  }
  
  return chunks.filter(chunk => chunk.length > 100);
}

// Run migration
migrateDocuments().catch(error => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});