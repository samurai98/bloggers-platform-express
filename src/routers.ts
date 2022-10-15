import { Express } from "express";

import { productsRouter } from "./modules/products/routes/products-router";
import { addressesRouter } from "./modules/products/routes/addresses-router";
import { blogsRouter } from "./modules/blogs/routes/blogs-router";
import { postsRouter } from "./modules/posts/routes/posts-router";
import { deleteAllRouter } from "./common/routes/delete-router";

const router = {
  products: "/products",
  addresses: "/addresses",
  ht_04: "/hometask_04/api",
  blogs: "/blogs",
  posts: "/posts",
  delete_all: "/testing/all-data",
} as const;

const blogs_router = `${router.ht_04}${router.blogs}` as const;
const posts_router = `${router.ht_04}${router.posts}` as const;
const delete_all_router = `${router.ht_04}${router.delete_all}` as const;

export const useRouters = (app: Express) => {
  app.use(router.products, productsRouter);
  app.use(router.addresses, addressesRouter);

  app.use(blogs_router, blogsRouter);
  app.use(posts_router, postsRouter);
  app.use(delete_all_router, deleteAllRouter);
};
