import request from "supertest";

import { app } from "../../src";
import { HTTP_STATUSES } from "../../src/common/http-statuses";
import { jwtService } from "../../src/common/services/jwt-service";
import { router } from "../../src/routers";
import { Blog } from "../../src/modules/blogs/blog";
import { User } from "../../src/modules/users/user";
import { Post } from "../../src/modules/posts/post";
import { Comment } from "../../src/modules/comments/comment";
import { authPath } from "../../src/modules/auth/routes/auth-router";
import { usersQueryRepository } from "../../src/modules/users/repositories";

import {
  basicAuth,
  bearerAuth,
  validBlogs,
  validComments,
  validPosts,
  validUsers,
} from "./data";
import { anyString, dateISORegEx, setBearerAuth } from "./helpers";

export const createUser = async ({ isLogin = false, validUserIndex = 0 }) => {
  const res = await request(app)
    .post(router.users)
    .set(basicAuth)
    .send(validUsers[validUserIndex]);

  expect(res.statusCode).toEqual(HTTP_STATUSES.CREATED_201);
  expect(res.body).toEqual({
    ...validUsers[validUserIndex],
    password: undefined,
    id: anyString,
    createdAt: dateISORegEx,
  });

  const createdUser: User = { ...res.body };

  // Conformation user
  const userDB = await usersQueryRepository.findUserByLoginOrEmail(
    createdUser.email
  );

  await request(app)
    .post(`${router.auth}${authPath.confirmRegistration}`)
    .send({ code: userDB?.emailConfirmation.confirmationCode })
    .expect(HTTP_STATUSES.NO_CONTENT_204);

  if (!isLogin) return createdUser;

  const loginRes = await request(app)
    .post(`${router.auth}${authPath.login}`)
    .send({
      login: validUsers[validUserIndex].email,
      password: validUsers[validUserIndex].password,
    });

  const expectedToken = await jwtService.getUserIdByToken(
    loginRes.body.accessToken
  );

  expect(loginRes.statusCode).toEqual(HTTP_STATUSES.OK_200);
  expect(expectedToken).toEqual(createdUser.id);

  setBearerAuth(loginRes.body.accessToken);

  return createdUser;
};

export const createBlog = async () => {
  const res = await request(app)
    .post(router.blogs)
    .set(basicAuth)
    .send(validBlogs[0]);

  const createdBlog: Blog = res.body;

  expect(res.statusCode).toEqual(HTTP_STATUSES.CREATED_201);
  expect(createdBlog).toEqual({
    ...validBlogs[0],
    id: anyString,
    createdAt: dateISORegEx,
  });

  return createdBlog;
};

export const createPost = async (createdBlog: Blog) => {
  const newPost = { ...validPosts[0], blogId: createdBlog.id };

  const res = await request(app)
    .post(router.posts)
    .set(basicAuth)
    .send(newPost);

  const createdPost: Post = res.body;

  expect(res.statusCode).toEqual(HTTP_STATUSES.CREATED_201);
  expect(createdPost).toEqual({
    ...newPost,
    id: anyString,
    createdAt: dateISORegEx,
    blogName: createdBlog.name,
  });

  return createdPost;
};

export const createComment = async (createdPost: Post, createdUser: User) => {
  const comment = validComments[0];
  const res = await request(app)
    .post(`${router.posts}/${createdPost.id}/comments`)
    .set(bearerAuth)
    .send(comment);

  const createdComment: Comment = res.body;

  expect(res.statusCode).toEqual(HTTP_STATUSES.CREATED_201);
  expect(createdComment).toEqual({
    ...comment,
    id: anyString,
    userId: createdUser.id,
    userLogin: createdUser.login,
    createdAt: dateISORegEx,
  });

  return createdComment;
};
