import mongoose from 'mongoose';

import { CommentDB } from 'modules/comments/comment';
import { PostDB } from 'modules/posts/post';

const entityNames = ['comments', 'posts'] as const;

export type EntityName = typeof entityNames[number];

export type EntityDB = CommentDB | PostDB;

export type EntityDependencies = { entityModel: mongoose.Model<any> };

export const likeStatuses = ['None', 'Like', 'Dislike'] as const;

type LikeStatus = typeof likeStatuses[number];

export type LikesInfo = { likesCount: number; dislikesCount: number; myStatus: LikeStatus };

export type NewestLike = { addedAt: string; userId: string; login: string };

export type ExtendedLikesInfo = LikesInfo & { newestLikes: NewestLike[] };

export type ReactionDB = { userId: string; status: LikeStatus; createdAt: string };

export type ParamEntity = { entityId: string };

export type ReqBodyLikeStatus = { likeStatus: LikeStatus };
