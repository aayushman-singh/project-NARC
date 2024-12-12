import express, { Request, Response } from 'express';
import mongoose, { Schema, Document } from 'mongoose';
import multer, { FileFilterCallback } from 'multer';
import fs from 'fs';
import cors from 'cors';
import path from 'path';

// Interfaces
interface Log {
    timestamp: string;
    platform: string;
    activity: string;
    source: string;
}

interface FileUploadResponse {
    message: string;
    count: number;
}

interface IJsonLogInput {
    timestamp: string;
    activity: string;
    platform: string;
}

interface MulterRequest extends Request {
    files: Express.Multer.File[];
}

// Initialize Express app
const app = express();

// Middleware
// In your backend server.ts/server.js
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// MongoDB Schema
const logSchema = new Schema<ILog>({
    timestamp: { type: Date, required: true },
    platform: { type: String, required: true },
    activity: { type: String, required: true },
    source: { type: String, required: true }
});

const Log = mongoose.model<ILog>('Log', logSchema);

// Multer configuration
const storage = multer.diskStorage({
    destination: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        if (!fs.existsSync('uploads')) {
            fs.mkdirSync('uploads');
        }
        cb(null, 'uploads/');
    },
    filename: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        cb(null, file.originalname);
    }
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype === 'text/plain') {
        cb(null, true);
    } else {
        cb(null, false);
        cb(new Error('Only .txt files are allowed'));
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB limit
    }
});

// Routes
// Add this function near the top of your server.ts
const parseDateTime = (line: string): Date | null => {
    // Pattern for "Date: YYYYMMDD" format first
    const dateHeaderMatch = line.match(/Date:\s*(\d{4})(\d{2})(\d{2})/);
    if (dateHeaderMatch) {
        const [_, year, month, day] = dateHeaderMatch;
        // Look for time in the format "HH:MM AM/PM"
        const timeMatch = line.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (timeMatch) {
            const [_, hours, minutes, meridiem] = timeMatch;
            let hour = parseInt(hours);
            // Convert to 24-hour format
            if (meridiem.toLowerCase() === 'pm' && hour < 12) hour += 12;
            if (meridiem.toLowerCase() === 'am' && hour === 12) hour = 0;
            
            return new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day),
                hour,
                parseInt(minutes)
            );
        }
        // If no time found, use start of day
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Other date patterns
    const patterns = [
        {
            // 2024-03-14 15:30:00
            regex: /(\d{4})[-/](\d{1,2})[-/](\d{1,2})[\sT](\d{1,2}):(\d{1,2})(:\d{1,2})?/,
            parse: (m: RegExpMatchArray) => new Date(
                parseInt(m[1]), 
                parseInt(m[2]) - 1, 
                parseInt(m[3]), 
                parseInt(m[4]), 
                parseInt(m[5])
            )
        },
        {
            // Time only: 12:43 PM
            regex: /(\d{1,2}):(\d{2})\s*(AM|PM)/i,
            parse: (m: RegExpMatchArray) => {
                let hours = parseInt(m[1]);
                const minutes = parseInt(m[2]);
                const meridiem = m[3].toLowerCase();
                
                if (meridiem === 'pm' && hours < 12) hours += 12;
                if (meridiem === 'am' && hours === 12) hours = 0;
                
                const now = new Date();
                return new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate(),
                    hours,
                    minutes
                );
            }
        }
    ];

    for (const pattern of patterns) {
        const match = line.match(pattern.regex);
        if (match) {
            const date = pattern.parse(match);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
    }

    return null;
};

// Modify the upload route to handle entries as groups
app.post('/api/upload/text', upload.array('files'), async (req: MulterRequest, res: Response) => {
    try {
        if (!req.files || req.files.length === 0) {
            throw new Error('No files uploaded');
        }

        const logs: Partial<ILog>[] = [];
        
        for (const file of req.files) {
            try {
                const content = fs.readFileSync(file.path, 'utf-8');
                const lines = content.split('\n');
                let currentEntry = '';
                let currentDate: Date | null = null;
                
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    if (line.startsWith('Date:')) {
                        // Process previous entry if exists
                        if (currentEntry && currentDate) {
                            logs.push({
                                timestamp: currentDate,
                                activity: currentEntry.trim(),
                                platform: path.parse(file.originalname).name,
                                source: 'text'
                            });
                        }
                        // Start new entry
                        currentEntry = line;
                        currentDate = parseDateTime(line);
                    } else {
                        // Add line to current entry
                        currentEntry += '\n' + line;
                        
                        // Update time if found in content
                        const timeMatch = line.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                        if (timeMatch && currentDate) {
                            const updatedDate = parseDateTime(line);
                            if (updatedDate) {
                                currentDate = new Date(
                                    currentDate.getFullYear(),
                                    currentDate.getMonth(),
                                    currentDate.getDate(),
                                    updatedDate.getHours(),
                                    updatedDate.getMinutes()
                                );
                            }
                        }
                    }
                }

                // Process last entry
                if (currentEntry && currentDate) {
                    logs.push({
                        timestamp: currentDate,
                        activity: currentEntry.trim(),
                        platform: path.parse(file.originalname).name,
                        source: 'text'
                    });
                }
                
                fs.unlinkSync(file.path);
            } catch (fileError) {
                console.error('Error processing file:', file.originalname, fileError);
                throw fileError;
            }
        }

        if (logs.length === 0) {
            throw new Error('No valid log entries found in uploaded files');
        }

        // Sort logs by timestamp before saving
        logs.sort((a, b) => {
            return (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0);
        });

        const savedLogs = await Log.insertMany(logs);

        res.json({ 
            message: 'Text logs uploaded successfully', 
            count: logs.length,
            logs: savedLogs
        });
    } catch (error) {
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
// Database connection and server start
// Original problematic URL:
// mongodb+srv://aayushman2702:Lmaoded@11@cluster0.eivmu.mongodb.net/logDB?retryWrites=true&w=majority

// Special characters in the password need to be properly encoded
const password = encodeURIComponent('Lmaoded@11');
const mongoUrl = `mongodb+srv://aayushman2702:${password}@cluster0.eivmu.mongodb.net/logDB?retryWrites=true&w=majority`;

mongoose.connect(mongoUrl)
    .then(() => {
        app.listen(5002, () => {
            console.log('Server running on port 5002');
        });
    })
    .catch((error) => {
        console.error('Database connection error:', error);
    });
export default app;