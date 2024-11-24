import { MongoClient, ObjectId } from "mongodb";
import { updateUserHistory } from "../src/Helpers/mongoUtils"; // Adjust the path as needed
import dotenv from "dotenv";

dotenv.config();

const runTest = async () => {
    const userId = "673f3c7a82b1bf86ed245993"; // Replace with a valid user ID from your database
    const phoneNumber = "+1234567890";
    const resultId = "63e000000000000000000000"; // Mock result ID (ObjectId as a string)
    const platform = "instagram";

    try {
        console.log("Connecting to MongoDB...");
        const client = new MongoClient(process.env.MONGO_URI); // Replace with your MongoDB connection string
        await client.connect();

        console.log("Connected to MongoDB.");
        console.log("Testing updateUserHistory function...");
        const objectId = new ObjectId(userId);
        await updateUserHistory(objectId, phoneNumber, resultId, platform);

        console.log("Test completed successfully!");
    } catch (error) {
        console.error("Error during test:", error);
    } finally {
        console.log("Closing MongoDB connection.");
    }
};

runTest();
