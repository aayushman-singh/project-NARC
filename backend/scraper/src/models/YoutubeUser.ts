import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for a single log entry (activity logs)
interface ILog {
  url: string;
}

// Interface for the YoutubeUser schema
export interface IYoutubeUser extends Document {
  email: string;
  logs: ILog[];
}

// Log schema definition
const logSchema = new Schema<ILog>(
  {
    url: {
      type: String,
      required: true,
    },
  },
  { _id: false } // Prevents automatic _id generation for each log entry
);

// YoutubeUser schema definition
const YoutubeUserSchema = new Schema<IYoutubeUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    logs: [logSchema], // Embed the log schema
  },
  {
    collection: "youtube_users", // Collection name in MongoDB
    timestamps: true, // Automatically manage `createdAt` and `updatedAt`
  }
);

// YoutubeUser model
const YoutubeUser: Model<IYoutubeUser> = mongoose.model<IYoutubeUser>("YoutubeUser", YoutubeUserSchema);

export default YoutubeUser;
