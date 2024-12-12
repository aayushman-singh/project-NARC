import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for a single drive file entry
interface IDriveFile {
  mimeType: string;
  webViewLink: string;
  size: string;
  id: string;
  name: string;
  createdTime: string;
}

// Interface for the Google Drive user schema
export interface IGoogleDriveUser extends Document {
  email: string;
  driveFiles: IDriveFile[];
}

// Drive file schema definition
const driveFileSchema = new Schema<IDriveFile>(
  {
    mimeType: {
      type: String,
      required: true,
    },
    webViewLink: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    createdTime: {
      type: String,
      required: true,
    },
  },
  { _id: false } // To prevent automatic _id generation for each file entry
);

// Google Drive user schema definition
const googleDriveUserSchema = new Schema<IGoogleDriveUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    driveFiles: [driveFileSchema], // Embed the drive files schema
  },
  {
    collection: "drive_users", // Collection name in MongoDB
    timestamps: true, // Automatically manage `createdAt` and `updatedAt`
  }
);

// Google Drive user model
const GoogleDriveUser: Model<IGoogleDriveUser> = mongoose.model<IGoogleDriveUser>(
  "GoogleDriveUser",
  googleDriveUserSchema
);

export default GoogleDriveUser;
