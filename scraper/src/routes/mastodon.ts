import express from "express";
import cors from "cors";
import { scrapeMastodon } from "../Helpers/Mastodon/mastodonScraper"; // Adjust path as needed
import { Request, Response } from "express";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

interface ScrapingRequest {
    email: string;
    password: string;
    userId: string;
}

// GET endpoint to check if server is running
app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "Server is running" });
});

// POST endpoint to trigger scraping
app.post("/mastodon", async (req: Request, res: Response) => {
    const { email, password, userId }: ScrapingRequest = req.body;

    // Validate required fields
    if (!email || !password || !userId) {
        return res.status(400).json({
            success: false,
            message:
                "Missing required fields: email, password, and userId are required",
        });
    }

    try {
        console.log(`Starting Mastodon scraping for user: ${email}`);

        const result = await scrapeMastodon(email, password, userId);

        if (result.success) {
            res.json({
                success: true,
                message: "Scraping completed successfully",
                data: {
                    articlesCount: result.articlesCount,
                    message: result.message,
                },
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Scraping failed",
                error: result.error,
            });
        }
    } catch (error) {
        console.error("Error during scraping:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message,
    });
});

const PORT = 3012;

app.listen(PORT, () => {
    console.log(`Mastodon scraping server running on http://localhost:${PORT}`);
});
