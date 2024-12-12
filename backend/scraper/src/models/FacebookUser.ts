import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for a friend object
export interface IFriend {
    index: number;
    userName: string;
    profilePicUrl: string;
    profileUrl: string;
}

// Interface for a post object
export interface IPost {
    s3Url: string;
    timestamp: Date;
    postIndex: number;
}

// Interface for the Facebook user document
export interface IFacebookUser extends Document {
    username: string;
    timelines: Map<string, string>; // Dynamic key-value pairs for timeline URLs
    posts: IPost[]; // Array of post objects
    messages: Map<string, string>; // Dynamic key-value pairs for message URLs
    profile: string; // URL for profile picture
    friendsList: IFriend[]; // Array of friends
}

// Schema for friend objects
const friendSchema: Schema<IFriend> = new Schema({
    index: { type: Number, required: true },
    userName: { type: String, required: true, trim: true },
    profilePicUrl: { type: String, required: true },
    profileUrl: { type: String, required: true },
});

// Schema for post objects
const postSchema: Schema<IPost> = new Schema({
    s3Url: { type: String, required: true },
    timestamp: { type: Date, required: true },
    postIndex: { type: Number, required: true },
});

// Schema for Facebook users
const facebookUserSchema: Schema<IFacebookUser> = new Schema(
    {
        username: { type: String, required: true, unique: true, trim: true },
        timelines: { type: Map, of: String, required: true },
        posts: { type: [postSchema], required: true },
        messages: { type: Map, of: String, required: false },
        profile: { type: String, required: true },
        friendsList: { type: [friendSchema], required: false },
    },
    {
        collection: "facebook_users",
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

// Create the model for FacebookUser
const FacebookUser: Model<IFacebookUser> = mongoose.model<IFacebookUser>(
    "FacebookUser",
    facebookUserSchema
);

export default FacebookUser;
