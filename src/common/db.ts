import { MongoClient } from "mongodb";

import { Product } from "modules/products/product";
import { Blog } from "modules/blogs/blog";
import { Post } from "modules/posts/post";
import { CommentDB } from "modules/comments/comment";
import { UserDB } from "modules/users/user";
import { SETTINGS } from "settings/config";

const client = new MongoClient(SETTINGS.MONGO_DB_URI);

const shopDB = client.db("shop");
const homeTaskDB = client.db("hometask");

export const productsCollection = shopDB.collection<Product>("products");
export const blogsCollection = homeTaskDB.collection<Blog>("blogs");
export const postsCollection = homeTaskDB.collection<Post>("posts");
export const commentsCollection = homeTaskDB.collection<CommentDB>("comments");
export const usersCollection = homeTaskDB.collection<UserDB>("users");

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
