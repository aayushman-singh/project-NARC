import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for metadata within an email
interface IMetadata {
  [key: string]: any;
}

// Interface for the body within an email
interface IBody {
  [key: string]: any;
}

// Interface for a single email entry
interface IEmail {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  historyId: string;
  internalDate: string;
  sizeEstimate: number;
  metadata: IMetadata;
  attachments: string[];
  body: IBody;
}

// Interface for the Google Out User schema
export interface IGmailOutUser extends Document {
  email: string;
  emails: IEmail[];
}

// Email schema definition
const emailSchema = new Schema<IEmail>(
  {
    id: {
      type: String,
      required: true,
    },
    threadId: {
      type: String,
      required: true,
    },
    labelIds: {
      type: [String],
      required: true,
    },
    snippet: {
      type: String,
      required: true,
    },
    historyId: {
      type: String,
      required: true,
    },
    internalDate: {
      type: String,
      required: true,
    },
    sizeEstimate: {
      type: Number,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      required: false,
    },
    attachments: {
      type: [String],
      required: false,
    },
    body: {
      type: Schema.Types.Mixed,
      required: false,
    },
  },
  { _id: false } // Prevents automatic _id generation for each email entry
);

// Google Out User schema definition
const GmailOutUserSchema = new Schema<IGmailOutUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    emails: [emailSchema], // Embed the email schema
  },
  {
    collection: "gmail_sent", // Collection name in MongoDB
    timestamps: true, // Automatically manage `createdAt` and `updatedAt`
  }
);

// Google Out User model
const GmailOutUser: Model<IGmailOutUser> = mongoose.model<IGmailOutUser>("GmailOutUser", GmailOutUserSchema);

export default GmailOutUser;