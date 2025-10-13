"use server";

import prisma from "@/lib/db";
import { readFile, access } from "fs/promises";
import { join } from "path";

export async function debugAiPdfData(packageId: string) {
  try {
    // Get package data from database
    const coursePackage = await prisma.coursePackage.findUnique({
      where: { id: packageId },
      select: { 
        id: true,
        name: true,
        aiPdfData: true, 
        aiProvider: true 
      }
    });
    
    if (!coursePackage) {
      return { 
        success: false, 
        error: 'Package not found',
        data: null
      };
    }
    
    const result: any = {
      packageId: coursePackage.id,
      packageName: coursePackage.name,
      aiPdfData: coursePackage.aiPdfData,
      aiProvider: coursePackage.aiProvider,
      fileExists: false,
      fileSize: 0,
      canParse: false
    };
    
    if (coursePackage.aiPdfData) {
      // Check if file exists
      const dataFolder = join(process.cwd(), 'docs/ai-pdfs');
      const filePath = join(dataFolder, coursePackage.aiPdfData);
      
      try {
        await access(filePath);
        result.fileExists = true;
        result.filePath = filePath;
        
        // Check file size
        const fileContent = await readFile(filePath, 'utf-8');
        result.fileSize = fileContent.length;
        result.fileSizeMB = (fileContent.length / (1024 * 1024)).toFixed(2);
        
        // Try to parse
        try {
          const pdfData = JSON.parse(fileContent);
          result.canParse = true;
          result.hasBase64Data = !!pdfData.base64Data;
          result.hasFileName = !!pdfData.fileName;
          result.storedAiProvider = pdfData.aiProvider;
          result.base64Length = pdfData.base64Data?.length || 0;
        } catch (parseError) {
          result.parseError = (parseError as Error).message;
        }
      } catch (accessError) {
        result.fileError = (accessError as Error).message;
      }
    }
    
    return { 
      success: true, 
      data: result 
    };
  } catch (error) {
    console.error('Debug error:', error);
    return { 
      success: false, 
      error: (error as Error).message,
      data: null
    };
  }
}

