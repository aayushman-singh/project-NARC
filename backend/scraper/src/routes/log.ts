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
    const patterns = [
        /(\d{4}[-/]\d{1,2}[-/]\d{1,2}[\sT]\d{1,2}:\d{1,2}(:\d{1,2})?)/,  // 2024-03-14 15:30:00
        /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}[\s,]+\d{1,2}:\d{1,2}(:\d{1,2})?)/,  // 14-03-2024 15:30:00
        /(\d{1,2}:\d{1,2}(:\d{1,2})?[\s,]+[AP]M)/i,  // 3:30:00 PM
        /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/,  // 14-03-2024
        /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i,  // 14 March 2024
        /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{2,4}/i   // March 14, 2024
    ];

    for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
            const date = new Date(match[0]);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
    }
    return null;
};

// Modify your text file upload route
app.post('/api/upload/text', upload.array('files'), async (req: MulterRequest, res: Response) => {
    try {
        if (!req.files || req.files.length === 0) {
            throw new Error('No files uploaded');
        }

        const logs: Partial<ILog>[] = [];
        const MAX_LOGS = 1000; // Maximum number of log entries allowed
        
        for (const file of req.files) {
            try {
                const content = fs.readFileSync(file.path, 'utf-8');
                const lines = content.split('\n');
                
                for (const line of lines) {
                    if (line.trim()) {
                        if (logs.length >= MAX_LOGS) {
                            // Clean up remaining files
                            req.files.forEach(f => {
                                if (fs.existsSync(f.path)) {
                                    fs.unlinkSync(f.path);
                                }
                            });
                            throw new Error(`Maximum limit of ${MAX_LOGS} log entries exceeded`);
                        }

                        const timestamp = parseDateTime(line);
                        if (timestamp) {
                            logs.push({
                                timestamp,
                                activity: line.trim(),
                                platform: path.parse(file.originalname).name,
                                source: 'text'
                            });
                        } else {
                            logs.push({
                                timestamp: new Date(),
                                activity: line.trim(),
                                platform: path.parse(file.originalname).name,
                                source: 'text'
                            });
                        }
                    }
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

        await Log.insertMany(logs);
        res.json({ 
            message: 'Text logs uploaded successfully', 
            count: logs.length
        });
    } catch (error) {
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

app.get('/api/logs', async (req: Request, res: Response) => {
    try {
        const logs = await Log.find()
            .sort({ timestamp: 1 })
            .select('-__v')
            .exec();
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
});
app.delete('/api/logs', async (req: Request, res: Response) => {
    try {
        await Log.deleteMany({});
        res.json({ message: 'All logs cleared successfully' });
    } catch (error) {
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message });
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