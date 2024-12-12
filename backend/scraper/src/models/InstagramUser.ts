import mongoose, { Schema, Document, Model } from "mongoose";

// Define the interface for the InstagramUser document
export interface IInstagramUser extends Document {
    username: string;
    fullName: string;
    biography: string;
    profilePicUrl: string;
    followersCount: number;
    followsCount: number;
    postsCount: number;
    timeline: string[]; // Array of URLs for timeline data
    posts: IPost[]; // Array of post objects
    followers: IUser[]; // Array of followers (simplified structure)
    following: IUser[]; // Array of following (simplified structure)
    messages: IMessage[]; // Array of messages
    isVerified: boolean;
    joinedRecently: boolean;
}

// Define the post object interface
export interface IPost {
    postId: string;
    type: string; // e.g., 'Image', 'Video'
    caption: string;
    url: string;
    commentsCount: number;
    likesCount: number;
    timestamp: Date;
    mediaUrl: string; // URL of the media (image/video)
}

// Define the user object interface (for followers/following)
export interface IUser {
    username: string;
    profilePicUrl: string;
}

// Define the message object interface
export interface IMessage {
    content: string;
    timestamp: Date;
}

// Define the schema for InstagramUser
const instagramUserSchema: Schema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        biography: {
            type: String,
            default: "No biography provided",
        },
        profilePicUrl: {
            type: String,
            required: true,
        },
        followersCount: {
            type: Number,
            default: 0,
        },
        followsCount: {
            type: Number,
            default: 0,
        },
        postsCount: {
            type: Number,
            default: 0,
        },
        timeline: {
            type: [String], // Array of timeline URLs
            required: true,
        },
        posts: [
            {
                postId: {
                    type: String,
                    required: true,
                },
                type: {
                    type: String,
                    required: true,
                },
                caption: {
                    type: String,
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                },
                commentsCount: {
                    type: Number,
                    required: true,
                },
                likesCount: {
                    type: Number,
                    required: true,
                },
                timestamp: {
                    type: Date,
                    required: true,
                },
                mediaUrl: {
                    type: String,
                    required: true,
                },
            },
        ],
        followers: [
            {
                username: {
                    type: String,
                    required: true,
                },
                profilePicUrl: {
                    type: String,
                    required: true,
                },
            },
        ],
        following: [
            {
                username: {
                    type: String,
                    required: true,
                },
                profilePicUrl: {
                    type: String,
                    required: true,
                },
            },
        ],
        chats: [
            {
                receiverUsername: {
                    type: String,
                    required: true,
                },
                screenshots: {
                    type: [String], // Array of strings for screenshot URLs
                    required: true,
                },
                chats: {
                    type: String, // Single URL string for the chat content
                    required: true,
                },
            },
        ],

        isVerified: {
            type: Boolean,
            default: false,
        },
        joinedRecently: {
            type: Boolean,
            default: false,
        },
    },
    {
        collection: "instagram_users", // Specify the collection name
        timestamps: true, // Automatically add createdAt and updatedAt fields
    },
);

// Create the model based on the schema
const InstagramUser: Model<IInstagramUser> = mongoose.model<IInstagramUser>(
    "InstagramUser",
    instagramUserSchema,
);

export default InstagramUser;
