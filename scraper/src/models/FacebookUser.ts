import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for a friend object
export interface IFriend {
    index: number;
    userName: string;
    profilePicUrl: string;
    profileUrl: string;
}

// Interface for a chat object
export interface IChat {
    receiverUsername: string;
    screenshots: string[]; // Array of URLs for chat screenshots
    chatUrl: string; // URL for chat content
}

// Interface for a post object
export interface IPost {
    png: string; // URL of the PNG image
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
    chats: IChat[]; // Array of chat objects
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
    png: { type: String, required: true }, // PNG URL for the post image
    timestamp: { type: Date, required: true },
    postIndex: { type: Number, required: true },
});

// Schema for chat objects
const chatSchema: Schema<IChat> = new Schema({
    receiverUsername: { type: String, required: true },
    screenshots: { type: [String], required: true }, // Array of screenshot URLs
    chatUrl: { type: String, required: true }, // URL for chat content
});

// Schema for Facebook users
const facebookUserSchema: Schema<IFacebookUser> = new Schema(
    {
        username: { type: String, required: true, unique: true, trim: true },
        timelines: { type: Map, of: String, required: true }, // Storing timeline URLs in a Map
        posts: { type: [postSchema], required: true }, // Array of posts
        messages: { type: Map, of: String, required: false }, // Optional dynamic messages map
        profile: { type: String, required: true }, // URL for profile picture
        friendsList: { type: [friendSchema], required: false }, // Array of friends
        chats: { type: [chatSchema], required: false }, // Array of chat objects
    },
    {
        collection: "facebook_users",
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Create the model for FacebookUser
const FacebookUser: Model<IFacebookUser> = mongoose.model<IFacebookUser>(
    "FacebookUser",
    facebookUserSchema
);

export default FacebookUser;
