import mongoose, { Schema, Document, Model } from "mongoose";

// Define interfaces
interface IEntity {
  hashtags: string[];
  symbols: string[];
  timestamps: string[];
  urls: string[];
  user_mentions: string[];
}

interface IDescriptionEntity {
  urls: {
    display_url: string;
    expanded_url: string;
    url: string;
    indices: number[];
  }[];
}

interface IUser {
  following: boolean;
  can_dm: boolean;
  can_media_tag: boolean;
  created_at: string;
  default_profile: boolean;
  default_profile_image: boolean;
  description: string;
  entities: {
    description: IDescriptionEntity;
  };
  fast_followers_count: number;
  favourites_count: number;
  followers_count: number;
  friends_count: number;
  has_custom_timelines: boolean;
  is_translator: boolean;
  listed_count: number;
  location: string;
  media_count: number;
  name: string;
  normal_followers_count: number;
  pinned_tweet_ids_str: string[];
  possibly_sensitive: boolean;
  profile_image_url_https: string;
  profile_interstitial_type: string;
  screen_name: string;
  statuses_count: number;
  translator_type: string;
  verified: boolean;
  want_retweets: boolean;
  withheld_in_countries: string[];
}

interface ITweet {
  bookmark_count: number;
  created_at: string;
  conversation_id_str: string;
  entities: IEntity;
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

interface IChat {
  receiverUsername: string;
  screenshots: string[];
  chats: string;
}

interface IFollower {
  username: string;
  profilePic: string;
}

export interface ITwitterUser extends Document {
  username: string;
  timeline: string;
  tweets: ITweet[];
  followers: IFollower[];
  following: IFollower[];
  chats: IChat[];
}

// Define schemas
const entitySchema = new Schema<IEntity>(
  {
    hashtags: { type: [String], default: [] },
    symbols: { type: [String], default: [] },
    timestamps: { type: [String], default: [] },
    urls: { type: [String], default: [] },
    user_mentions: { type: [String], default: [] },
  },
  { _id: false },
);

const descriptionEntitySchema = new Schema<IDescriptionEntity>(
  {
    urls: [
      {
        display_url: { type: String },
        expanded_url: { type: String },
        url: { type: String },
        indices: { type: [Number], default: [] },
      },
    ],
  },
  { _id: false },
);

const userSchema = new Schema<IUser>(
  {
    following: { type: Boolean },
    can_dm: { type: Boolean },
    can_media_tag: { type: Boolean },
    created_at: { type: String },
    default_profile: { type: Boolean },
    default_profile_image: { type: Boolean },
    description: { type: String },
    entities: {
      description: descriptionEntitySchema,
    },
    fast_followers_count: { type: Number },
    favourites_count: { type: Number },
    followers_count: { type: Number },
    friends_count: { type: Number },
    has_custom_timelines: { type: Boolean },
    is_translator: { type: Boolean },
    listed_count: { type: Number },
    location: { type: String },
    media_count: { type: Number },
    name: { type: String },
    normal_followers_count: { type: Number },
    pinned_tweet_ids_str: { type: [String], default: [] },
    possibly_sensitive: { type: Boolean },
    profile_image_url_https: { type: String },
    profile_interstitial_type: { type: String },
    screen_name: { type: String },
    statuses_count: { type: Number },
    translator_type: { type: String },
    verified: { type: Boolean },
    want_retweets: { type: Boolean },
    withheld_in_countries: { type: [String], default: [] },
  },
  { _id: false },
);

const tweetSchema = new Schema<ITweet>(
  {
    bookmark_count: { type: Number },
    created_at: { type: String },
    conversation_id_str: { type: String },
    entities: entitySchema,
    extended_entities: Schema.Types.Mixed,
    favorite_count: { type: Number },
    favorited: { type: Boolean },
    full_text: { type: String },
    is_quote_status: { type: Boolean },
    lang: { type: String },
    possibly_sensitive: { type: Boolean, default: null },
    possibly_sensitive_editable: { type: Boolean, default: null },
    quote_count: { type: Number },
    reply_count: { type: Number },
    retweet_count: { type: Number },
    retweeted: { type: Boolean },
    user_id_str: { type: String },
    id_str: { type: String },
    url: { type: String },
    views_count: { type: Number, default: null },
    user: userSchema,
  },
  { _id: false },
);

const chatSchema = new Schema<IChat>(
  {
    receiverUsername: { type: String, required: true },
    screenshots: { type: [String], default: [] },
    chats: { type: String, required: true },
  },
  { _id: false },
);

const followerSchema = new Schema<IFollower>(
  {
    username: { type: String, required: true },
    profilePic: { type: String, required: true },
  },
  { _id: false },
);

const twitterUserSchema = new Schema<ITwitterUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    timeline: { type: String, required: true },
    tweets: [tweetSchema],
    followers: { type: [followerSchema], default: [] },
    following: { type: [followerSchema], default: [] },
    chats: { type: [chatSchema], default: [] },
  },
  {
    collection: "twitter_users",
    timestamps: true,
  },
);

// Model definition
const TwitterUser: Model<ITwitterUser> = mongoose.model<ITwitterUser>(
  "TwitterUser",
  twitterUserSchema,
);

export default TwitterUser;
