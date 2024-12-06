import express from "express";
import { google } from "googleapis";
import * as dotenv from "dotenv";
import cors from "cors";

dotenv.config();

// const CLIENT_ID = process.env.CLIENT_ID!;
// const CLIENT_SECRET = process.env.CLIENT_SECRET!;
// const REDIRECT_URI = process.env.REDIRECT_URI!;

const MONGODB_URI =
    "mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/facebookDB?retryWrites=true&w=majority";
const CLIENT_ID =
    "218022995131-pkv99vvugfmhr73ua600lg44q362bbsj.apps.googleusercontent.com";
const PROJECT_ID = "tattletale-443715";
const AUTH_URI = "https://accounts.google.com/o/oauth2/auth";
const TOKEN_URI = "https://oauth2.googleapis.com/token";
const AUTH_PROVIDER_X509_CERT_URL =
    "https://www.googleapis.com/oauth2/v1/certs";
const CLIENT_SECRET = "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";
const JAVASCRIPT_ORIGINS = "http://localhost";
const REDIRECT_URI = "http://localhost:3006/oauth2callback";

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

// Scopes for Gmail API
const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

const app = express();
app.use(cors());

app.get("/", (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES, // Use Gmail scope
        redirect_uri: REDIRECT_URI, // Include the redirect_uri explicitly
    });

    console.log("Generated Auth URL:", authUrl); // Debugging
    res.send(`<a href="${authUrl}">Authenticate with Google</a>`);
});

app.get("/oauth2callback", async (req, res) => {
    const code = req.query.code as string;
    if (code) {
        try {
            const { tokens } = await oAuth2Client.getToken(code);
            oAuth2Client.setCredentials(tokens);
            const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

            // List the user's emails
            const messagesResponse = await gmail.users.messages.list({
                userId: "me",
                maxResults: 10,
            });

            const messages = messagesResponse.data.messages || [];
            const emailDataPromises = messages.map(async (message) => {
                const msg = await gmail.users.messages.get({
                    userId: "me",
                    id: message.id!,
                });
                return msg.data;
            });

            const emailData = await Promise.all(emailDataPromises);
            res.json(emailData);
        } catch (error) {
            console.error("Error retrieving emails:", error);
            res.status(500).send("Error during email retrieval");
        }
    } else {
        res.status(400).send("No code found in query parameters");
    }
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
