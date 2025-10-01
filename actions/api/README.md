# API Server Actions - Professional Structure

This directory contains all API-related Server Actions organized in a professional folder structure. All traditional API routes have been converted to Server Actions for better performance, type safety, and maintainability.

## 📁 Directory Structure

```
actions/api/
├── index.ts                 # Centralized exports
├── materials/              # Course materials management
│   └── materials.ts
├── ai-pdfs/               # AI PDF data management
│   └── ai-pdfs.ts
├── videos/                # Video file management
│   └── videos.ts
├── upload/                # File upload operations
│   └── video-upload.ts
├── chat/                  # AI chat integrations
│   ├── chatgpt.ts
│   └── gemini.ts
├── student/               # Student-related operations
│   └── student-questions.ts
├── ustaz/                 # Ustaz-related operations
│   └── ustaz-questions.ts
└── auth/                  # Authentication (if needed)
```

## 🚀 Key Features

### ✅ **Type Safety**
- All Server Actions are fully typed with TypeScript interfaces
- Input validation and error handling
- Consistent response formats

### ✅ **Performance**
- Server-side execution reduces client-side bundle size
- Automatic caching and optimization
- Reduced API calls and network overhead

### ✅ **Security**
- Built-in authentication checks
- Input sanitization and validation
- Server-side only execution

### ✅ **Maintainability**
- Centralized logic in Server Actions
- Consistent error handling patterns
- Easy to test and debug

## 📋 Available Actions

### Materials API (`actions/api/materials/`)
- `getMaterialFileInfo(filename)` - Get file metadata
- `getMaterialFileData(filename)` - Get file content (base64)
- `listMaterialFiles()` - List all material files

### AI PDFs API (`actions/api/ai-pdfs/`)
- `getAiPdfFileInfo(filename)` - Get PDF metadata
- `getAiPdfFileData(filename)` - Get PDF content (base64)
- `listAiPdfFiles()` - List all AI PDF files

### Videos API (`actions/api/videos/`)
- `getVideoFileInfo(filename)` - Get video metadata
- `getVideoFileData(filename)` - Get video content (base64, small files only)
- `listVideoFiles()` - List all video files
- `getVideoStreamUrl(filename)` - Get streaming URL

### Upload API (`actions/api/upload/`)
- `uploadVideoChunk(chunk, filename, chunkIndex, totalChunks)` - Chunked video upload
- `uploadVideoFile(file, filename)` - Direct video upload
- `deleteVideoFile(filename)` - Delete video file
- `listUploadedVideos()` - List uploaded videos

### Chat API (`actions/api/chat/`)
- `sendChatMessage(messages, packageId)` - Send message to ChatGPT
- `sendGeminiMessage(messages, packageId)` - Send message to Gemini
- `getAiPdfDataForPackage(packageId)` - Get AI PDF data for package

### Student API (`actions/api/student/`)
- `getStudentQuestions()` - Get student's questions
- `getStudentQuestion(questionId)` - Get single question

### Ustaz API (`actions/api/ustaz/`)
- `getUstazQuestions()` - Get questions for ustaz
- `respondToQuestion(questionId, response)` - Respond to question
- `deleteResponse(responseId)` - Delete response

## 🔄 Migration from API Routes

### Before (API Route)
```typescript
// app/api/materials/[filename]/route.ts
export async function GET(request: NextRequest) {
  // Complex API logic
  return NextResponse.json(data);
}
```

### After (Server Action)
```typescript
// actions/api/materials/materials.ts
export async function getMaterialFileInfo(filename: string) {
  // Clean Server Action logic
  return { success: true, data: fileInfo };
}
```

## 📖 Usage Examples

### In Components
```typescript
import { getMaterialFileInfo } from '@/actions/api';

const MaterialComponent = () => {
  const handleGetFile = async (filename: string) => {
    const result = await getMaterialFileInfo(filename);
    if (result.success) {
      console.log(result.data);
    }
  };
};
```

### Error Handling
```typescript
const result = await getMaterialFileInfo(filename);
if (!result.success) {
  console.error(result.error);
  // Handle error
}
```

## 🛠️ Development Guidelines

1. **Always use TypeScript interfaces** for input/output types
2. **Include proper error handling** with success/error response format
3. **Add authentication checks** where needed
4. **Validate inputs** before processing
5. **Use consistent naming** conventions
6. **Document complex logic** with comments

## 🔧 Configuration

Server Actions are automatically configured in `next.config.ts`:
```typescript
serverActions: {
  bodySizeLimit: "1000mb", // For large file uploads
}
```

## 📝 Notes

- File serving APIs (like `/api/materials/[filename]`) are kept as API routes since Server Actions can't serve binary data directly
- Authentication is handled by NextAuth v5
- All actions include proper error handling and type safety
- Large file operations use chunked uploads for better performance

