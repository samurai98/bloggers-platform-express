import express, { Router } from "express";
import bodyParser from "body-parser";

import { productsRouter } from "./routes/products-router";
import { addressesRouter } from "./routes/addresses-router";
import { videosRouter } from "./routes/videos-router";
import { blogsRouter } from "./routes/blogs-router";
import { postsRouter } from "./routes/posts-router";

const app = express();
const port = process.env.PORT || 3000;

const parserMiddleware = bodyParser({});
app.use(parserMiddleware);

const router = {
  products: "/products",
  addresses: "/addresses",
  ht_01_videos: "/hometask_01/api/videos",
  ht_02_blogs: "/ht_02/api/blogs",
  ht_02_posts: "/ht_02/api/posts",
} as const;

app.use(router.products, productsRouter);
app.use(router.addresses, addressesRouter);
app.use(router.ht_01_videos, videosRouter);
app.use(router.ht_02_blogs, blogsRouter);
app.use(router.ht_02_posts, postsRouter);

/** TESTING ROUTER */
app.use(
  "/hometask_02/api/testing/all-data",
  Router({}).delete("/", (req: any, res: any) => {
    res.send(204);
  })
);
/**************/

// start app
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
