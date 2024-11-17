import mongoose, { Schema, Document, Model } from 'mongoose';

interface IEntities {
  // Add specific entity fields if needed
}

interface IUser {
  // Add user fields if needed
}

interface ITweet {
  bookmark_count: number;
  created_at: string;
  conversation_id_str: string;
  entities: IEntities;
  extended_entities: any;
  favorite_count: number;
  favorited: boolean;
  full_text: string;
  is_quote_status: boolean;
  lang: string;
  possibly_sensitive: boolean | null;
  possibly_sensitive_editable: boolean | null;
  quote_count: number;
  reply_count: number;
  retweet_count: number;
  retweeted: boolean;
  user_id_str: string;
  id_str: string;
  url: string;
  views_count: number | null;
  user: IUser;
}

export interface ITwitterUser extends Document {
  username: string;
  tweets: ITweet[];
  timeline: any; // You can define a more specific type if needed
}

const entitiesSchema = new Schema({
  // Add specific entity fields if needed
}, { _id: false });

const userSchema = new Schema({
  // Add user fields if needed
}, { _id: false });

const tweetSchema = new Schema({
  bookmark_count: Number,
  created_at: String,
  conversation_id_str: String,
  entities: entitiesSchema,
  extended_entities: Schema.Types.Mixed,
  favorite_count: Number,
  favorited: Boolean,
  full_text: String,
  is_quote_status: Boolean,
  lang: String,
  possibly_sensitive: Boolean,
  possibly_sensitive_editable: Boolean,
  quote_count: Number,
  reply_count: Number,
  retweet_count: Number,
  retweeted: Boolean,
  user_id_str: String,
  id_str: String,
  url: String,
  views_count: Number,
  user: userSchema
}, { _id: false });

const twitterUserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  tweets: [tweetSchema],
  timeline: Schema.Types.Mixed
}, {
  collection: 'twitter_users',
  timestamps: true,
});

const TwitterUser: Model<ITwitterUser> = mongoose.model<ITwitterUser>('TwitterUser', twitterUserSchema);

export default TwitterUser;