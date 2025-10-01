// API Server Actions - Professional Structure
// This file provides a centralized export of all API-related Server Actions

// Materials API
export {
  getMaterialFileInfo,
  getMaterialFileData,
  listMaterialFiles,
  type MaterialFileInfo,
  type MaterialFileData,
} from './materials/materials';

// AI PDFs API
export {
  getAiPdfFileInfo,
  getAiPdfFileData,
  listAiPdfFiles,
  type AiPdfFileInfo,
  type AiPdfFileData,
} from './ai-pdfs/ai-pdfs';

// Videos API
export {
  getVideoFileInfo,
  getVideoFileData,
  listVideoFiles,
  getVideoStreamUrl,
  type VideoFileInfo,
  type VideoFileData,
} from './videos/videos';

// Upload API
export {
  uploadVideoChunk,
  uploadVideoFile,
  deleteVideoFile,
  listUploadedVideos,
  type VideoUploadResult,
} from './upload/video-upload';

// Chat API
export {
  sendChatMessage,
  getAiPdfDataForPackage,
  type ChatMessage,
  type ChatResponse,
} from './chat/chatgpt';

export {
  sendGeminiMessage,
} from './chat/gemini';

// Student API
export {
  getStudentQuestions,
  getStudentQuestion,
  type StudentQuestion,
} from './student/student-questions';

// Ustaz API
export {
  getUstazQuestions,
  respondToQuestion,
  deleteResponse,
  type UstazQuestion,
} from './ustaz/ustaz-questions';

// Auth API (if needed)
// Note: NextAuth handles authentication, but we can add custom auth actions here if needed

