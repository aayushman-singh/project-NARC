import express from "express";
import axios from "axios";
import qs from "qs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import {
    insertInboxEmail,
    insertSentEmail,
    updateUserHistory,
} from "../Helpers/mongoUtils.js";
import mongoose from "mongoose";
import { Request, Response } from "express";
import GmailInUser, { IGmailInUser } from "../models/Gmail/GmailInUser.js";
import GmailOutUser, { IGmailOutUser } from "../models/Gmail/GmailOutUser.js";
import { __dirname } from "../../../../config.js";

const CLIENT_ID =
    "218022995131-pkv99vvugfmhr73ua600lg44q362bbsj.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "http://localhost:3006/oauth2callback";
const TOKEN_PATH = path.join(__dirname, "token.json");

// Connect to MongoDB (your existing code remains the same)


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
app.use(express.json());

let userEmail = "";
let emailLimit = 10;
let user = '';

app.get("/gmailOut/users", async (req: Request, res: Response) => {
    try {
        console.log("Fetching users from database...");
        const users: IGmailOutUser[] = await GmailOutUser.find().lean();
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

app.get("/gmailIn/users", async (req: Request, res: Response) => {
    try {
        console.log("Fetching users from database...");
        const users: IGmailInUser[] = await GmailInUser.find().lean();
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
app.get("/gmailOut/users/:username", async (req: Request, res: Response) => {
    const { username } = req.params;

    try {
        console.log(`Fetching user with username: ${username}`);
        const user: IGmailOutUser | null = await GmailOutUser.findOne({
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
app.get("/gmailIn/users/:username", async (req: Request, res: Response) => {
    const { username } = req.params;

    try {
        console.log(`Fetching user with username: ${username}`);
        const user: IGmailInUser | null = await GmailInUser.findOne({
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

app.get("/emails", async (req, res) => {
    if (!fs.existsSync(TOKEN_PATH)) {
        return res
            .status(400)
            .send("No tokens found. Please authenticate first.");
    }

    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
    const accessToken = tokens.access_token;

    try {
        // Fetch both inbox and sent messages
        const [inboxEmails, sentEmails] = await Promise.all([
            fetchGmailMessages(accessToken, "INBOX", emailLimit),
            fetchGmailMessages(accessToken, "in:sent", emailLimit),
        ]);

        // Store emails and get resultIds
        const inboxResult = await insertInboxEmail(
            userEmail,
            inboxEmails,
            "gmail",
            true
        );
        const sentResult = await insertSentEmail(
            userEmail,
            sentEmails,
            "gmail",
            false
        );

        // Update user history with both results
        await Promise.all([
            updateUserHistory(user, userEmail, inboxResult, "gmail-inbox"),
            updateUserHistory(user, userEmail, sentResult, "gmail-sent"),
        ]);

        console.log(
            `Successfully processed ${inboxEmails.length} inbox and ${sentEmails.length} sent emails`
        );

        res.json({
            success: true,
            counts: {
                inbox: inboxEmails.length,
                sent: sentEmails.length,
            },
        });
    } catch (error) {
        console.error(
            "Error fetching emails:",
            error.response?.data || error.message
        );
        res.status(500).send("Error fetching emails.");
    }
});

// Modified auth-url endpoint to include necessary scopes
app.post("/auth-url", (req, res) => {
    const { userId ,email, limit } = req.body;

    if (!email || typeof limit !== "number") {
        return res
            .status(400)
            .json({ success: false, message: "Invalid email or limit." });
    }

    user = userId;
    userEmail = email;
    emailLimit = limit;
    console.log("Variables updated");
    
    const authUrl = `https://accounts.google.com/o/oauth2/auth?${qs.stringify({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: "code",
        scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify",
        access_type: "offline",
        prompt: "consent",
    })}`;
    res.json({ authUrl });
    
});

async function fetchGmailMessages(
    accessToken: string,
    label: string,
    maxResults: number
) {
    try {
        const response = await axios.get(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages",
            {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                    maxResults,
                    q: label,
                },
            }
        );

        const messages = response.data.messages || [];
        const emailData = await Promise.all(
            messages.map(async (message: any) => {
                const msg = await axios.get(
                    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
                    {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }
                );
                // Add a small delay to avoid rate limiting
                await new Promise((resolve) => setTimeout(resolve, 100));
                return parseEmail(msg.data);
            })
        );

        return emailData;
    } catch (error) {
        console.error(`Error fetching ${label} messages:`, error);
        throw error;
    }
}

function parseEmail(email: any) {
    const headers = email.payload.headers || [];
    const getHeader = (name: string) =>
        headers.find((h: any) => h.name === name)?.value;

    // Extract attachments
    const attachments: any[] = [];
    function processPayloadParts(payload: any) {
        if (payload.parts) {
            payload.parts.forEach((part: any) => {
                if (part.filename && part.body) {
                    attachments.push({
                        filename: part.filename,
                        mimeType: part.mimeType,
                        size: part.body.size || 0,
                        attachmentId: part.body.attachmentId || null,
                    });
                }
                if (part.parts) {
                    processPayloadParts(part);
                }
            });
        }
    }
    processPayloadParts(email.payload);

    // Extract body content
    let plainBody = "";
    let htmlBody = "";
    function extractBody(payload: any) {
        if (payload.mimeType === "text/plain" && payload.body?.data) {
            plainBody = Buffer.from(payload.body.data, "base64").toString(
                "utf-8"
            );
        }
        if (payload.mimeType === "text/html" && payload.body?.data) {
            htmlBody = Buffer.from(payload.body.data, "base64").toString(
                "utf-8"
            );
        }
        if (payload.parts) {
            payload.parts.forEach((part: any) => extractBody(part));
        }
    }
    extractBody(email.payload);

    return {
        id: email.id,
        threadId: email.threadId,
        labelIds: email.labelIds || [],
        snippet: email.snippet || "",
        historyId: email.historyId,
        internalDate: email.internalDate,
        sizeEstimate: email.sizeEstimate,
        metadata: {
            subject: getHeader("Subject") || "No Subject",
            from: getHeader("From") || "Unknown Sender",
            to: getHeader("To") || "Unknown Recipient",
            cc: getHeader("Cc"),
            bcc: getHeader("Bcc"),
            date: getHeader("Date"),
            messageId: getHeader("Message-ID"),
            references: getHeader("References"),
            inReplyTo: getHeader("In-Reply-To"),
            contentType: getHeader("Content-Type"),
            deliveredTo: getHeader("Delivered-To"),
            returnPath: getHeader("Return-Path"),
            receivedSPF: getHeader("Received-SPF"),
            authentication: getHeader("Authentication-Results"),
            mimeVersion: getHeader("MIME-Version"),
        },
        attachments,
        body: {
            plain: plainBody,
            html: htmlBody,
        },
    };
}

const PORT = 3006;
app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
