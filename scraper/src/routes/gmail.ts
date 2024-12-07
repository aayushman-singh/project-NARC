import express from "express";
import axios from "axios";
import qs from "qs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { insertEmail } from "../Helpers/mongoUtils";
import mongoose from "mongoose";
import { Request, Response } from "express";
import GmailUser, { IGmailUser } from "../models/GmailUser.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLIENT_ID =
    "218022995131-pkv99vvugfmhr73ua600lg44q362bbsj.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "http://localhost:3006/oauth2callback";
const TOKEN_PATH = path.join(__dirname, "token.json");
const connectDB = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/gmailDB?retryWrites=true&w=majority",
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
const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON bodies

let userEmail = ""; // Temporary storage for email
let emailLimit = 10; // Default email limit

app.get("/gmail/users", async (req: Request, res: Response) => {
    try {
        console.log("Fetching users from database...");
        const users: IGmailUser[] = await GmailUser.find().lean();
        console.log(`Found ${users.length} users`);

        if (users.length === 0) {
            console.log("No users found in the database");
            return res.status(404).json({ message: "No users found" });
        }

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: (error as Error).message });
    }
});

app.get("/gmail/users/:username", async (req: Request, res: Response) => {
    const { username } = req.params;

    try {
        console.log(`Fetching user with username: ${username}`);
        const user: IGmailUser | null = await GmailUser.findOne({
            email: username, // Match against the `email` field
          }).lean();
          

        if (!user) {
            console.log(`User not found: ${username}`);
            return res.status(404).json({ message: "User not found" });
        }

        console.log(`User found: ${username}`);
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: (error as Error).message });
    }
});



// Endpoint to generate OAuth URL
app.post("/auth-url", (req, res) => {
    const { email, limit } = req.body;

    // Validate inputs
    if (!email || typeof limit !== "number") {
        return res
            .status(400)
            .json({ success: false, message: "Invalid email or limit." });
    }

    // Store email and limit for future use
    userEmail = email;
    emailLimit = limit;
    console.log('variables updated')
    // Generate the OAuth URL
    const authUrl = `https://accounts.google.com/o/oauth2/auth?${qs.stringify({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: "code",
        scope: "https://www.googleapis.com/auth/gmail.readonly",
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

        // Trigger fetching emails (use full URL)
        const emailFetchResponse = await axios.get(
            "http://localhost:3006/emails"
        );

        // Return the fetched email data to the client
        res.json({
            success: true,
            message: "Authorization successful! Emails have been fetched.",
            emails: emailFetchResponse.data,
        });
    } catch (error) {
        console.error(
            "Error exchanging authorization code or fetching emails:",
            error.response?.data || error.message
        );
        res.status(500).send("Error during token exchange or email fetching.");
    }
});


// Fetch emails endpoint
app.get("/emails", async (req, res) => {
    if (!fs.existsSync(TOKEN_PATH)) {
        return res
            .status(400)
            .send("No tokens found. Please authenticate first.");
    }

    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
    const accessToken = tokens.access_token;

    try {
        const response = await axios.get(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages",
            {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { maxResults: emailLimit }, // Use the stored email limit
            }
        );

        const messages = response.data.messages || [];

        // Collect all parsed email data
        const emailData = await Promise.all(
            messages.map(async (message: any) => {
                const msg = await axios.get(
                    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
                    {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }
                );
                return parseEmail(msg.data); // Parse each email
            })
        );

        // Insert the entire array into the database at once
        await insertEmail(userEmail, emailData, "gmail");

        console.log("Emails successfully inserted");
        res.json({ success: true});
    } catch (error) {
        console.error(
            "Error fetching emails:",
            error.response?.data || error.message
        );
        res.status(500).send("Error fetching emails.");
    }
});

// Helper function to parse email data
function parseEmail(email: any) {
    const headers = email.payload.headers || [];
    const subject =
        headers.find((h: any) => h.name === "Subject")?.value || "No Subject";
    const from =
        headers.find((h: any) => h.name === "From")?.value || "Unknown Sender";
    const body = email.payload.body?.data
        ? Buffer.from(email.payload.body.data, "base64").toString("utf-8")
        : "No Body";
    return { id: email.id, subject, from, body };
}

const PORT = 3006;
app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
