const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PDFParser = require('pdf2json');
const { extractSkillsFromText } = require('./aiService');

const UPLOADS_DIR = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e5)}`;
    cb(null, `resume-${cleanBase}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.txt', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext) || file.mimetype.includes('pdf') || file.mimetype.includes('text')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, TXT, DOC, and DOCX resume formats are supported.'));
  }
};

const uploadResume = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

/**
 * Extract plain text from PDF buffer/file
 */
function extractTextFromPdf(filePath) {
  return new Promise((resolve) => {
    try {
      const parser = new PDFParser(null, 1);
      parser.on('pdfParser_dataReady', () => {
        try {
          const raw = parser.getRawTextContent() || '';
          // Decode URL-encoded components if present
          const decoded = decodeURIComponent(raw.replace(/\r\n/g, '\n'));
          resolve(decoded);
        } catch (e) {
          try {
            resolve(parser.getRawTextContent() || '');
          } catch {
            resolve('');
          }
        }
      });
      parser.on('pdfParser_dataError', (err) => {
        console.warn('PDF parsing warning:', err);
        resolve('');
      });
      parser.loadPDF(filePath);
    } catch (err) {
      console.warn('PDF parser load error:', err);
      resolve('');
    }
  });
}

/**
 * Parse uploaded resume file to text & detect skills
 */
async function parseResumeFile(file) {
  let extractedText = '';
  const ext = path.extname(file.originalname).toLowerCase();

  try {
    if (ext === '.pdf') {
      extractedText = await extractTextFromPdf(file.path);
    } else if (ext === '.txt') {
      extractedText = fs.readFileSync(file.path, 'utf8');
    } else {
      // For binary word/doc or fallback, attempt utf-8 string extraction
      const raw = fs.readFileSync(file.path, 'utf8');
      extractedText = raw.replace(/[^\x20-\x7E\t\n\r]/g, ' ');
    }
  } catch (err) {
    console.error('Error reading resume file:', err);
  }

  // Auto extract skills from parsed text
  const extractedSkills = extractSkillsFromText(extractedText);

  return {
    extractedText: extractedText.trim(),
    extractedSkills,
    url: `/uploads/resumes/${file.filename}`,
    fileName: file.filename,
    originalName: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype
  };
}

module.exports = {
  uploadResume,
  parseResumeFile,
  UPLOADS_DIR
};
