import express from "express";
import axios from "axios";
import qs from "qs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { insertDriveInfo } from "../Helpers/mongoUtils";

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
    if (code) {
        try {
            const { tokens } = await oAuth2Client.getToken(code);
            oAuth2Client.setCredentials(tokens);

            const drive = google.drive({ version: "v3", auth: oAuth2Client });

            // List the user's Google Drive files
            const filesResponse = await drive.files.list({
                pageSize: 10,
                fields: "nextPageToken, files(id, name, mimeType, size)",
            });

            const files = filesResponse.data.files || [];
            res.json({
                message: "Files fetched successfully!",
                files,
            });
        } catch (error) {
            console.error("Error retrieving files:", error);
            res.status(500).send("Error during Google Drive file retrieval");
        }
    } else {
        res.status(400).send("No code found in query parameters");
    }
});



const PORT = process.env.PORT || 3009;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
