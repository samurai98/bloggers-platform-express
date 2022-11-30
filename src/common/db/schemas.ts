import mongoose from 'mongoose';

import { BlogDB } from '../../modules/blogs/blog';
import { PostDB } from '../../modules/posts/post';
import { CommentDB } from '../../modules/comments/comment';
import { UserDB } from '../../modules/users/user';
import { RefreshSessionDB } from '../../modules/auth/auth';

const reaction = {
  userId: { type: String, required: true },
  status: { type: String, required: true },
  createdAt: { type: String, required: true },
};

export const blogSchema = new mongoose.Schema<BlogDB>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  websiteUrl: { type: String, required: true },
  userId: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: String, required: true },
});

export const postsSchema = new mongoose.Schema<PostDB>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  content: { type: String, required: true },
  blogId: { type: String, required: true },
  blogName: { type: String, required: true },
  createdAt: { type: String, required: true },
  reactions: [reaction],
});

export const commentsSchema = new mongoose.Schema<CommentDB>({
  id: { type: String, required: true },
  content: { type: String, required: true },
  userId: { type: String, required: true },
  createdAt: { type: String, required: true },
  postId: { type: String, required: true },
  reactions: [reaction],
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
    confirmationCode: String,
    expirationDate: Date,
    isConfirmed: { type: Boolean, required: true },
  },
  passwordRecovery: { recoveryCode: String, expirationDate: Date },
});

export const sessionsSchema = new mongoose.Schema<RefreshSessionDB>({
  refreshToken: { type: String, required: true },
  issuedAt: { type: Number, required: true },
  expiresIn: { type: Number, required: true },
  userId: { type: String, required: true },
  ip: { type: String, required: true },
  deviceId: { type: String, required: true },
  deviceName: { type: String, required: true },
});
