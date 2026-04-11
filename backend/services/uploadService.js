import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../uploads');
const publicDir = path.join(__dirname, '../public');

// Create required directories
export function ensureUploadDirs() {
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('✅ Created uploads directory');
    }
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
      console.log('✅ Created public directory');
    }
  } catch (error) {
    console.error('❌ Failed to create directories:', error.message);
  }
}

export const uploadDirPath = uploadDir;
export const publicDirPath = publicDir;
