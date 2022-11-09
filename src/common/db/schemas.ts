import mongoose from "mongoose";

import { Blog } from "modules/blogs/blog";
import { Post } from "modules/posts/post";
import { CommentDB } from "modules/comments/comment";
import { UserDB } from "modules/users/user";
import { RefreshSession } from "modules/auth/auth";

export const blogSchema = new mongoose.Schema<Blog>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  youtubeUrl: { type: String, required: true },
  createdAt: { type: String, required: true },
});

export const postsSchema = new mongoose.Schema<Post>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  content: { type: String, required: true },
  blogId: { type: String, required: true },
  blogName: { type: String, required: true },
  createdAt: { type: String, required: true },
});

export const commentsSchema = new mongoose.Schema<CommentDB>({
  id: { type: String, required: true },
  content: { type: String, required: true },
  userId: { type: String, required: true },
  userLogin: { type: String, required: true },
  createdAt: { type: String, required: true },
  postId: { type: String, required: true },
});

export const usersSchema = new mongoose.Schema<UserDB>({
  accountData: {
    id: { type: String, required: true },
    email: { type: String, required: true },
    login: { type: String, required: true },
    createdAt: { type: String, required: true },
    passHash: { type: String, required: true },
    passSalt: { type: String, required: true },
  },
  emailConfirmation: {
    confirmationCode: { type: String, required: true },
    expirationDate: { type: Date, required: true },
    isConfirmed: { type: Boolean, required: true },
  },
});

export const sessionsSchema = new mongoose.Schema<RefreshSession>({
  refreshToken: { type: String, required: true },
  issuedAt: { type: Number, required: true },
  expiresIn: { type: Number, required: true },
  userId: { type: String, required: true },
  ip: { type: String, required: true },
  deviceId: { type: String, required: true },
  deviceName: { type: String, required: true },
});
