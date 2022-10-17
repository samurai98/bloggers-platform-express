import { MongoClient } from "mongodb";
import dotenv from "dotenv";

import { Product } from "../modules/products/product";
import { Blog } from "../modules/blogs/blog";
import { Post } from "../modules/posts/post";
import { UserDB } from "../modules/users/user";

dotenv.config();

const mongoUri = process.env.mongoURI || "mongodb://0.0.0.0:27017";

const client = new MongoClient(mongoUri);

const shopDB = client.db("shop");
const homeTaskDB = client.db("hometask");

export const productsCollection = shopDB.collection<Product>("products");
export const blogsCollection = homeTaskDB.collection<Blog>("blogs");
export const postsCollection = homeTaskDB.collection<Post>("posts");
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
