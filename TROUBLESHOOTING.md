# Troubleshooting AI PDF Issues

## Issue: "No PDF documents uploaded" error from Gemini

### Steps to Fix:

#### 1. **Restart Your Development Server**
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

**Why?** The code changes won't take effect until you restart.

#### 2. **Delete Old PDF Files**
Delete these files from `docs/ai-pdfs/`:
- Any file with `.pdf.pdf.json` (double extension)
- Files that were uploaded before the fixes

```bash
# On Windows PowerShell:
Remove-Item docs\ai-pdfs\*.pdf.pdf.json
```

#### 3. **Clear the Database Entry**
Go to the admin panel and click "Remove" on the existing AI PDF Data to clear the old reference.

#### 4. **Make Sure API Key is Valid**
Check your `.env` file has the correct Gemini API key:
```env
GEMINI_API_KEY="your_actual_gemini_key_here"
```

Get a key from: https://makersuite.google.com/app/apikey

#### 5. **Re-upload a SMALL PDF (Under 15MB)**
- Use a smaller test PDF (1-5 MB is ideal for testing)
- Make sure it's a real PDF, not a scanned image
- Wait for "Upload complete!" message

#### 6. **Clear Browser Cache** (Optional)
If the issue persists:
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or clear browser cache for localhost

#### 7. **Check Console Logs**
Open your terminal where the server is running and look for:
```
Adding PDF to Gemini: filename.pdf, size: XXXKB
Sending 1 PDF(s) to Gemini with question: ...
```

If you don't see these logs, the PDF isn't being loaded correctly.

#### 8. **Test with a Simple Question**
Ask something very basic like:
- "What is this document about?"
- "Summarize the first page"

## Still Not Working?

### Check Your Database
Run this debug function by temporarily adding it to your page:

```typescript
import { debugAiPdfData } from "@/actions/admin/debugAiPdf";

// In your component
const debug = await debugAiPdfData(packageId);
console.log('Debug info:', debug);
```

This will show:
- Is the file in the database?
- Does the file exist on disk?
- Can it be parsed?
- What's the file size?

### Common Issues:

| Symptom | Cause | Solution |
|---------|-------|----------|
| "No PDF uploaded" | Server not restarted | Restart server |
| "API key invalid" | Wrong/missing API key | Check `.env` file |
| "Too large" error | PDF > 15MB | Use smaller PDF |
| Old response cached | Cache not cleared | Wait 5 minutes or restart server |
| Double .pdf.pdf.json | Old upload system | Delete and re-upload |

### Need More Help?
1. Check the terminal logs for errors
2. Check the browser console (F12) for errors
3. Try the debug function above
4. Share the console output for further diagnosis

