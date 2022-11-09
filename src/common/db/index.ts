import mongoose from "mongoose";

import { SETTINGS } from "settings/config";

import {
  blogSchema,
  postsSchema,
  commentsSchema,
  usersSchema,
  sessionsSchema,
} from "./schemas";

export const BlogModel = mongoose.model("blogs", blogSchema);
export const PostModel = mongoose.model("posts", postsSchema);
export const CommentModel = mongoose.model("comments", commentsSchema);
export const UserModel = mongoose.model("users", usersSchema);
export const SessionModel = mongoose.model("sessions", sessionsSchema);

export async function runDB() {
  try {
    await mongoose.connect(SETTINGS.MONGO_DB_URI);
    console.log("Connected successfully to mongo server");
  } catch (err) {
    console.log("Can't connect to db");
    console.error(err);

    await mongoose.disconnect();
  }
}
