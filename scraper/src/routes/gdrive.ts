import express from "express";
import axios from "axios";
import qs from "qs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { insertDriveInfo } from "../Helpers/mongoUtils";
import { Request, Response } from "express";
import GoogleDriveUser, { IGoogleDriveUser } from "../models/GoogleDriveUser";
import mongoose from "mongoose";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLIENT_ID =
    "218022995131-pkv99vvugfmhr73ua600lg44q362bbsj.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "http://localhost:3009/oauth2callback";
const TOKEN_PATH = path.join(__dirname, "drive_token.json");

const app = express();
app.use(cors());
app.use(express.json());

let userEmail = ""; // Temporary storage for email
const connectDB = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/driveDB?retryWrites=true&w=majority",
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            } as mongoose.ConnectOptions,
        );
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};
connectDB();
// Endpoint to generate OAuth URL
app.post("/auth-url", (req, res) => {
    const { email } = req.body;

    // Validate input
    if (!email) {
        return res
            .status(400)
            .json({ success: false, message: "Invalid email." });
    }

    // Store email for future use
    userEmail = email;

    // Generate the OAuth URL
    const authUrl = `https://accounts.google.com/o/oauth2/auth?${qs.stringify({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: "code",
        scope: "https://www.googleapis.com/auth/drive.metadata.readonly",
        access_type: "offline",
        prompt: "consent",
    })}`;
    res.json({ authUrl });
});

// OAuth callback endpoint
app.get("/oauth2callback", async (req, res) => {
    const code = req.query.code as string;
    if (!code) {
        return res.status(400).send("Authorization code is missing.");
    }

    try {
        const response = await axios.post(
            "https://oauth2.googleapis.com/token",
            qs.stringify({
                code,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                grant_type: "authorization_code",
            }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        // Save tokens
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(response.data, null, 2));

        // Trigger fetching Drive files (use full URL)
        const driveFetchResponse = await axios.get("http://localhost:3009/drive-files");

        // Return the fetched file data to the client
        res.json({
            success: true,
            message: "Authorization successful! Drive files have been fetched.",
            files: driveFetchResponse.data,
        });
    } catch (error) {
        console.error(
            "Error exchanging authorization code or fetching Drive files:",
            error.response?.data || error.message
        );
        res.status(500).send("Error during token exchange or Drive file fetching.");
    }
});

app.get("/drive/users", async (req: Request, res: Response) => {
    try {
        console.log("Fetching Google Drive users from database...");
        const users: IGoogleDriveUser[] = await GoogleDriveUser.find().lean();
        console.log(`Found ${users.length} Google Drive users`);

        if (users.length === 0) {
            console.log("No Google Drive users found in the database");
            return res.status(404).json({ message: "No users found" });
        }

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching Google Drive users:", error);
        res.status(500).json({ error: (error as Error).message });
    }
});
app.get("/drive/users/:email", async (req: Request, res: Response) => {
    const { email } = req.params;

    try {
        console.log(`Fetching Google Drive user with email: ${email}`);
        const user: IGoogleDriveUser | null = await GoogleDriveUser.findOne({ email }).lean();

        if (!user) {
            console.log(`Google Drive user not found: ${email}`);
            return res.status(404).json({ message: "User not found" });
        }

        console.log(`Google Drive user found: ${email}`);
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching Google Drive user:", error);
        res.status(500).json({ error: (error as Error).message });
    }
});

// Fetch Google Drive files endpoint
app.get("/drive-files", async (req, res) => {
    if (!fs.existsSync(TOKEN_PATH)) {
        return res
            .status(400)
            .send("No tokens found. Please authenticate first.");
    }

    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
    const accessToken = tokens.access_token;

    try {
        const response = await axios.get(
            "https://www.googleapis.com/drive/v3/files",
            {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                    fields: "files(id,name,mimeType,createdTime,size,webViewLink)",
                    pageSize: 100, // Limit the number of files
                },
            }
        );

        const files = response.data.files || [];

        // Insert files into the database
        await insertDriveInfo(userEmail, files, "drive");

        console.log("Drive files successfully inserted");
        res.json({ success: true, files });
    } catch (error) {
        console.error(
            "Error fetching Drive files:",
            error.response?.data || error.message
        );
        res.status(500).send("Error fetching Drive files.");
    }
});

const PORT = 3009;
app.listen(PORT, () =>
    console.log(`Google Drive Server running on http://localhost:${PORT}`)
);
