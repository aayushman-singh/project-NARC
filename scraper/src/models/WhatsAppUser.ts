import mongoose, { Schema, Document } from 'mongoose';

interface IChat {
  receiverUsername: string;
  screenshots: string[];
  chats: string;
}

export interface IWhatsAppUser extends Document {
  username: string;
  chats: IChat[];
}

const ChatSchema: Schema = new Schema({
  receiverUsername: { type: String, required: true },
  screenshots: { type: [String], required: true },
  chats: { type: String, required: true },
});

const WhatsAppUserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  chats: { type: [ChatSchema], required: true },
});

export const WhatsAppUser = mongoose.model<IWhatsAppUser>('WhatsAppUser', WhatsAppUserSchema);
