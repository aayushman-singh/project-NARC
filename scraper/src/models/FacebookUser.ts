import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for a friend object
export interface IFriend {
    index: number;
    userName: string;
    profilePicUrl: string;
    profileUrl: string;
}

// Interface for the Facebook user document
export interface IFacebookUser extends Document {
    username: string;
    timelines: { [key: string]: string }; // Dynamic key-value pairs for timeline URLs
    posts: { [key: string]: string }; // Dynamic key-value pairs for post URLs
    message: string; // URL for message data
    profile: string; // URL for profile picture
    friends: IFriend[]; // Array of friends
}

// Schema for friend objects
const friendSchema: Schema<IFriend> = new Schema({
    index: {
        type: Number,
        required: true,
    },
    userName: {
        type: String,
        required: true,
        trim: true,
    },
    profilePicUrl: {
        type: String,
        required: true,
    },
    profileUrl: {
        type: String,
        required: true,
    },
});

// Schema for Facebook users
const facebookUserSchema: Schema<IFacebookUser> = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        timelines: {
            type: Map, // Use a Map to handle dynamic key-value pairs for timelines
            of: String,
            required: true,
        },
        posts: {
            type: Map, // Use a Map to handle dynamic key-value pairs for posts
            of: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        profile: {
            type: String,
            required: true,
        },
        friends: {
            type: [friendSchema], // Use the friendSchema for friends array
            required: false,
        },
    },
    {
        collection: "facebook_users", // Specify the collection name
        timestamps: true, // Automatically add createdAt and updatedAt fields
    },
);

// Create the model for FacebookUser
const FacebookUser: Model<IFacebookUser> = mongoose.model<IFacebookUser>(
    "FacebookUser",
    facebookUserSchema,
);

export default FacebookUser;
