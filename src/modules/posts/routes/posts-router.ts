import { Router, Request, Response } from 'express';

import { HTTP_STATUSES } from '../../../common/http-statuses';
import { Query, ResType } from '../../../common/types/common';
import { addLikeStatusRouter } from '../../../common/modules/reactions';
import { commentByPostIdValidation } from '../../comments/routes/validation';
import { ResComment, ResComments } from '../../comments/comment';
import { commentsService, commentsStory } from '../../comments/services';

import { ReqBodyPost, ParamPost, ReqQueryPost, ResPost, ResPosts, ReqBodyCommentByPostId } from '../post';
import { postsService, postsStory } from '../services';
import { postValidation, checkBasicAuth, postsQueryValidation, commentsByPostQueryValidation } from './validation';

export const postsRouter = Router({});

postsRouter.get('/', postsQueryValidation, async (req: Request<{}, {}, {}, ReqQueryPost>, res: Response<ResPosts>) => {
  res.send(await postsStory.getPosts(req.query, req.requestContext.user?.id));
});

postsRouter.get('/:postId', async (req: Request<ParamPost>, res: Response<ResPost>) => {
  const post = await postsStory.getPostById(req.params.postId, req.requestContext.user?.id);

  if (post) res.send(post);
  else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
});

postsRouter.post('/', postValidation, async (req: Request<{}, {}, ReqBodyPost>, res: Response<ResPost>) => {
  const newPost = await postsService.createPost(req.body, req.requestContext.user?.id);

  res.status(HTTP_STATUSES.CREATED_201).send(newPost);
});

postsRouter.put(
  '/:postId',
  postValidation,
  async (req: Request<ParamPost, {}, ReqBodyPost>, res: Response<ResType>) => {
    const isUpdated = await postsService.updatePost(req.params.postId, req.body);

    if (isUpdated) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  }
);

postsRouter.delete('/:postId', checkBasicAuth, async (req: Request<ParamPost>, res: Response<ResType>) => {
  const isDeleted = await postsService.deletePost(req.params.postId);

  if (isDeleted) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
});

postsRouter.get(
  '/:postId/comments',
  commentsByPostQueryValidation,
  async (req: Request<ParamPost, {}, {}, Query>, res: Response<ResComments>) => {
    const { postId: postId } = req.params;

    if (!postId || !(await postsStory.getPostById(postId, undefined))) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      return;
    }

    const comments = await commentsStory.getComments({ ...req.query, postId }, req.requestContext.user?.id);

    if (comments) res.send(comments);
    else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  }
);

postsRouter.post(
  '/:postId/comments',
  commentByPostIdValidation,
  async (req: Request<ParamPost, {}, ReqBodyCommentByPostId>, res: Response<ResComment>) => {
    const { postId: postId } = req.params;

    if (!postId || !(await postsStory.getPostById(postId, undefined))) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      return;
    }

    const newComment = await commentsService.createComment({
      ...req.body,
      postId,
      userId: req.requestContext.user!.id,
      userLogin: req.requestContext.user!.login,
    });

    res.status(HTTP_STATUSES.CREATED_201).send(newComment);
  }
);

addLikeStatusRouter('posts', postsRouter);
