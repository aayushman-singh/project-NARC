import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFacebookUser extends Document {
    username: string;
    timelines: string[]; // Array of base64-encoded strings or file paths for timelines
    posts: string[]; // Array of base64-encoded strings or file paths for posts
    messages: string; // Base64-encoded string or file path for messages
}

const facebookUserSchema: Schema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        timelines: {
            type: [String], // Array of strings for timeline data
            required: true,
        },
        posts: {
            type: [String], // Array of strings for post data
            required: true,
        },
        messages: {
            type: String, // Single string for message data
            required: true,
        },
    },
    {
        collection: "facebook_users", // Specify the collection name
        timestamps: true, // Automatically add createdAt and updatedAt fields
    },
);

const FacebookUser: Model<IFacebookUser> = mongoose.model<IFacebookUser>(
    "FacebookUser",
    facebookUserSchema,
);

export default FacebookUser;
