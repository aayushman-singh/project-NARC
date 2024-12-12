import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for a single chat entry
interface IDiscordChat {
    receiverUsername: string;
    screenshots: string[];
    chats: string;
}

// Interface for the main Discord user schema
export interface IDiscordUser extends Document {
    username: string;
    chats: IDiscordChat[];
}

// Chat schema definition
const discordChatSchema = new Schema<IDiscordChat>(
    {
        receiverUsername: {
            type: String,
            required: true,
            trim: true,
        },
        screenshots: [
            {
                type: String,
                required: true,
            },
        ],
        chats: {
            type: String,
            required: true,
        },
    },
    { _id: false }, // To prevent automatic _id generation for each chat
);

// Discord user schema definition
const discordUserSchema = new Schema<IDiscordUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        chats: [discordChatSchema], // Embed the chat schema
    },
    {
        collection: "discord_users", // Collection name in MongoDB
        timestamps: true, // Automatically manage `createdAt` and `updatedAt`
    },
);

// Discord user model
const DiscordUser: Model<IDiscordUser> = mongoose.model<IDiscordUser>(
    "DiscordUser",
    discordUserSchema,
);

export default DiscordUser;
