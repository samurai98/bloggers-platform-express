import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import { productsRouter } from "./routes/products-router";
import { addressesRouter } from "./routes/addresses-router";
import { videosRouter } from "./routes/videos-router";
import { blogsRouter } from "./routes/blogs-router";
import { postsRouter } from "./routes/posts-router";
import { runDB } from "./repositories/db";
import { deleteAllRouter } from "./routes/delete-router";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const parserMiddleware = bodyParser({});
app.use(parserMiddleware);

const router = {
  products: "/products",
  addresses: "/addresses",
  ht_01_videos: "/hometask_01/api/videos",
  /** Home Task 3 */
  ht_03: "/hometask_03/api",
  blogs: "/blogs",
  posts: "/posts",
  delete_all: "/testing/all-data",
} as const;

const blogs_router = `${router.ht_03}${router.blogs}` as const;
const posts_router = `${router.ht_03}${router.posts}` as const;
const delete_all_router = `${router.ht_03}${router.delete_all}` as const;

app.use(router.products, productsRouter);
app.use(router.addresses, addressesRouter);
app.use(router.ht_01_videos, videosRouter);

app.use(blogs_router, blogsRouter);
app.use(posts_router, postsRouter);
app.use(delete_all_router, deleteAllRouter);

const startApp = async () => {
  await runDB();
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

startApp();
