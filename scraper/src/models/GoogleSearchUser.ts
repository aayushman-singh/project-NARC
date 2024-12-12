import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for a single log entry (activity logs)
interface ILog {
  url: string;
}

// Interface for the GoogleUser schema
export interface IGoogleUser extends Document {
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

// GoogleUser schema definition
const googleUserSchema = new Schema<IGoogleUser>(
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
    collection: "google_users", // Collection name in MongoDB
    timestamps: true, // Automatically manage `createdAt` and `updatedAt`
  }
);

// GoogleUser model
const GoogleUser: Model<IGoogleUser> = mongoose.model<IGoogleUser>("GoogleUser", googleUserSchema);

export default GoogleUser;
