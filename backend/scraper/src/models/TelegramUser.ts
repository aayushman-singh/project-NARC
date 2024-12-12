import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for a single chat entry
interface ITelegramChat {
    receiverUsername: string;
    logs: string;
    media_files: string[];
}

// Interface for the main Telegram user schema
export interface ITelegramUser extends Document {
    username: string;
    chats: ITelegramChat[];
}

// Chat schema definition
const telegramChatSchema = new Schema<ITelegramChat>(
    {
        receiverUsername: {
            type: String,
            required: true,
            trim: true,
        },
        logs: {
            type: String,
            required: true,
        },
        media_files: [
            {
                type: String,
                required: true,
            },
        ],
    },
    { _id: false }, // To prevent automatic _id generation for each chat
);

// Telegram user schema definition
const telegramUserSchema = new Schema<ITelegramUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        chats: [telegramChatSchema], // Embed the chat schema
    },
    {
        collection: "telegram_users", // Collection name in MongoDB
        timestamps: true, // Automatically manage `createdAt` and `updatedAt`
    },
);

// Telegram user model
const TelegramUser: Model<ITelegramUser> = mongoose.model<ITelegramUser>(
    "TelegramUser",
    telegramUserSchema,
);

export default TelegramUser;
