import mongoose from "mongoose";

import { Blog } from "modules/blogs/blog";
import { Post } from "modules/posts/post";
import { CommentDB } from "modules/comments/comment";
import { UserDB } from "modules/users/user";
import { RefreshSession } from "modules/auth/auth";

export const blogSchema = new mongoose.Schema<Blog>({
  id: String,
  name: String,
  youtubeUrl: String,
  createdAt: Date,
});

export const postsSchema = new mongoose.Schema<Post>({
  id: String,
  title: String,
  shortDescription: String,
  content: String,
  blogId: String,
  blogName: String,
  createdAt: Date,
});

export const commentsSchema = new mongoose.Schema<CommentDB>({
  id: String,
  content: String,
  userId: String,
  userLogin: String,
  createdAt: Date,
  postId: String,
});

export const usersSchema = new mongoose.Schema<UserDB>({
  accountData: {
    id: String,
    email: String,
    login: String,
    createdAt: Date,
    passHash: String,
    passSalt: String,
  },
  emailConfirmation: {
    confirmationCode: String,
    expirationDate: Date,
    isConfirmed: Boolean,
  },
});

export const sessionsSchema = new mongoose.Schema<RefreshSession>({
  refreshToken: String,
  issuedAt: Number,
  expiresIn: Number,
  userId: String,
  ip: String,
  deviceId: String,
  deviceName: String,
});
