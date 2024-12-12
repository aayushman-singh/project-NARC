import mongoose, { Schema, Document, Model } from "mongoose";

interface IChat {
    receiverUsername: string;
    screenshots: string[];
    chats: string;
}

export interface IWhatsappUser extends Document {
    username: string;
    chats: IChat[];
}

const chatSchema = new Schema(
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
    { _id: false },
);

const whatsappUserSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        chats: [chatSchema],
    },
    {
        collection: "whatsapp_users",
        timestamps: true,
    },
);

const WhatsappUser: Model<IWhatsappUser> = mongoose.model<IWhatsappUser>(
    "WhatsappUser",
    whatsappUserSchema,
);

export default WhatsappUser;
