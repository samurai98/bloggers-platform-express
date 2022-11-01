import { MongoClient } from "mongodb";

import { Blog } from "modules/blogs/blog";
import { Post } from "modules/posts/post";
import { CommentDB } from "modules/comments/comment";
import { UserDB } from "modules/users/user";
import { SETTINGS } from "settings/config";

const client = new MongoClient(SETTINGS.MONGO_DB_URI);

const bloggersPlatformDB = client.db();

export const blogsCollection = bloggersPlatformDB.collection<Blog>("blogs");
export const postsCollection = bloggersPlatformDB.collection<Post>("posts");
export const commentsCollection = bloggersPlatformDB.collection<CommentDB>("comments");
export const usersCollection = bloggersPlatformDB.collection<UserDB>("users");

export async function runDB() {
  try {
    await client.connect();
    console.log("Connected successfully to mongo server");
  } catch (err) {
    console.log("Can't connect to db");
    console.error(err);

    await client.close();
  }
}
