import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for the TimelineUser schema
export interface ITimelineUser extends Document {
    username: string;
    timeline: string;
    timeline_1: string;
    timeline_2: string;
    timeline_3: string;
    timeline_4: string;
    timeline_5: string;
    timeline_6: string;
    timeline_7: string;
    timeline_8: string;
    timeline_9: string;
    timeline_10: string;
}

// TimelineUser schema definition
const timelineUserSchema = new Schema<ITimelineUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        timeline: {
            type: String,
            required: true,
        },
        timeline_1: {
            type: String,
            required: true,
        },
        timeline_2: {
            type: String,
            required: true,
        },
        timeline_3: {
            type: String,
            required: true,
        },
        timeline_4: {
            type: String,
            required: true,
        },
        timeline_5: {
            type: String,
            required: true,
        },
        timeline_6: {
            type: String,
            required: true,
        },
        timeline_7: {
            type: String,
            required: true,
        },
        timeline_8: {
            type: String,
            required: true,
        },
        timeline_9: {
            type: String,
            required: true,
        },
        timeline_10: {
            type: String,
            required: true,
        }
    },
    {
        collection: "timeline_users", // Collection name in MongoDB
        timestamps: true, // Automatically manage `createdAt` and `updatedAt`
    }
);

// TimelineUser model
const TimelineUser: Model<ITimelineUser> = mongoose.model<ITimelineUser>(
    "TimelineUser",
    timelineUserSchema
);

export default TimelineUser;