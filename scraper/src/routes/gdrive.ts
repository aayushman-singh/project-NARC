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
const REDIRECT_URI = "http://localhost:3007/oauth2callback";
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
        const driveFetchResponse = await axios.get("http://localhost:3007/drive-files");

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

const PORT = 3007;
app.listen(PORT, () =>
    console.log(`Google Drive Server running on http://localhost:${PORT}`)
);
