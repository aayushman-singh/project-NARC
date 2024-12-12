import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for the Mastodon user schema
export interface IMastodonUser extends Document {
    username: string;
    feed: string;
    logs: string;
    feed_1: string;
    feed_2: string;
    feed_3: string;
    profile: string;
    profile_pic: string;
}

// Mastodon user schema definition
const mastodonUserSchema = new Schema<IMastodonUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        feed: {
            type: String,
            required: true,
        },
        logs: {
            type: String,
            required: true,
        },
        feed_1: {
            type: String,
            required: true,
        },
        feed_2: {
            type: String,
            required: true,
        },
        feed_3: {
            type: String,
            required: true,
        },
        profile: {
            type: String,
            required: true,
        },
        profile_pic: {
            type: String,
            required: true,
        },
    },
    {
        collection: "mastodon_users", // Collection name in MongoDB
        timestamps: true, // Automatically manage `createdAt` and `updatedAt`
    },
);

// Mastodon user model
const MastodonUser: Model<IMastodonUser> = mongoose.model<IMastodonUser>(
    "MastodonUser",
    mastodonUserSchema,
);

export default MastodonUser;