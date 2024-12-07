import express from "express";
import { google } from "googleapis";
import * as dotenv from "dotenv";
import cors from "cors";

const app = express();
app.use(express.json());

dotenv.config();

const MONGODB_URI =
    "mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/facebookDB?retryWrites=true&w=majority";
const CLIENT_ID =
    "218022995131-pkv99vvugfmhr73ua600lg44q362bbsj.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "http://localhost:3006/oauth2callback";

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

// Scopes for Google Drive API
const SCOPES = [
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
    "https://www.googleapis.com/auth/userinfo.profile",
];


app.use(cors());

app.get("/", (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
        redirect_uri: REDIRECT_URI,
    });

    console.log("Generated Auth URL:", authUrl);
    res.send({ authUrl });
});

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
