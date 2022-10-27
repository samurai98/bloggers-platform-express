import { Express } from "express";

import { productsRouter } from "./modules/products/routes/products-router";
import { addressesRouter } from "./modules/products/routes/addresses-router";
import { blogsRouter } from "./modules/blogs/routes/blogs-router";
import { postsRouter } from "./modules/posts/routes/posts-router";
import { deleteAllRouter } from "./common/routes/delete-router";
import { usersRouter } from "./modules/users/routes/users-router";
import { authRouter } from "./modules/users/routes/auth-router";
import { commentsRouter } from "modules/comments/routes/comments-router";

const router = {
  products: "/products",
  addresses: "/addresses",
  ht_06: "/hometask_06/api",
  blogs: "/blogs",
  posts: "/posts",
  comments: "/comments",
  users: "/users",
  auth: "/auth",
  delete_all: "/testing/all-data",
} as const;

const blogs_router = `${router.ht_06}${router.blogs}` as const;
const posts_router = `${router.ht_06}${router.posts}` as const;
const users_router = `${router.ht_06}${router.users}` as const;
const comments_router = `${router.ht_06}${router.comments}` as const;
const auth_router = `${router.ht_06}${router.auth}` as const;
const delete_all_router = `${router.ht_06}${router.delete_all}` as const;

export const useRouters = (app: Express) => {
  app.use(router.products, productsRouter);
  app.use(router.addresses, addressesRouter);

  app.use(blogs_router, blogsRouter);
  app.use(posts_router, postsRouter);
  app.use(comments_router, commentsRouter);
  app.use(users_router, usersRouter);
  app.use(auth_router, authRouter);

  app.use(delete_all_router, deleteAllRouter);
};

export {
  blogs_router,
  posts_router,
  users_router,
  auth_router,
  delete_all_router,
};
