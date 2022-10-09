import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { Blog, Post, Product } from "./types";

dotenv.config();

const mongoUri = process.env.mongoURI || "mongodb://0.0.0.0:27017";

export const client = new MongoClient(mongoUri);

const shopDB = client.db("shop");
export const productsCollection = shopDB.collection<Product>("products");

const homeTaskDB = client.db("hometask");
export const blogsCollection = homeTaskDB.collection<Blog>("blogs");
export const postsCollection = homeTaskDB.collection<Post>("posts");

export async function runDB() {
  try {
    await client.connect();
    await client.db("products").command({ ping: 1 });
    console.log("Connected successfully to mongo server");
  } catch (err) {
    console.log("Can't connect to db");
    console.error(err);

    await client.close();
  }
}
