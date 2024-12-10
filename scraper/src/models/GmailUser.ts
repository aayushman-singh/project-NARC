import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for a single email entry
interface IEmail {
  id: string;
  subject: string;
  from: string;
  body: string;
}

// Interface for the Gmail user schema
export interface IGmailUser extends Document {
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
    subject: {
      type: String,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
  },
  { _id: false } // Prevents automatic _id generation for each email entry
);

// Gmail user schema definition
const gmailUserSchema = new Schema<IGmailUser>(
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
    collection: "gmail_users", // Collection name in MongoDB
    timestamps: true, // Automatically manage `createdAt` and `updatedAt`
  }
);

// Gmail user model
const GmailUser: Model<IGmailUser> = mongoose.model<IGmailUser>("GmailUser", gmailUserSchema);

export default GmailUser;
