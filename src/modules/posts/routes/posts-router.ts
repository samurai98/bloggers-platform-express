import { Router, Request, Response } from 'express';

import { HTTP_STATUSES } from '../../../common/http-statuses';
import { Query, ResType } from '../../../common/types/common';
import { addLikeStatusRouter } from '../../../common/modules/reactions';
import { commentByPostIdValidation } from '../../comments/routes/validation';
import { ResComment, ResComments } from '../../comments/comment';

import { ReqBodyPost, ParamPost, ReqQueryPost, ResPost, ResPosts, ReqBodyCommentByPostId } from '../post';
import { postsService } from '../services/posts-service';
import { postValidation, checkBearerAuth, postsQueryValidation, commentsByPostQueryValidation } from './validation';

export const postsRouter = Router({});

postsRouter.get('/', postsQueryValidation, async (req: Request<{}, {}, {}, ReqQueryPost>, res: Response<ResPosts>) => {
  res.send(await postsService.getPosts(req.query, req.requestContext.user?.id));
});

postsRouter.get('/:id', async (req: Request<ParamPost>, res: Response<ResPost>) => {
  const post = await postsService.getPostById(req.params.id, req.requestContext.user?.id);

  if (post) res.send(post);
  else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
});

postsRouter.post('/', postValidation, async (req: Request<{}, {}, ReqBodyPost>, res: Response<ResPost>) => {
  const newPost = await postsService.createPost(req.body, req.requestContext.user?.id);

  res.status(HTTP_STATUSES.CREATED_201).send(newPost);
});

postsRouter.put('/:id', postValidation, async (req: Request<ParamPost, {}, ReqBodyPost>, res: Response<ResType>) => {
  const isUpdated = await postsService.updatePost(req.params.id, req.body);

  if (isUpdated) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
});

postsRouter.delete('/:id', checkBearerAuth, async (req: Request<ParamPost>, res: Response<ResType>) => {
  const isDeleted = await postsService.deletePost(req.params.id);

  if (isDeleted) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
});

postsRouter.get(
  '/:id/comments',
  commentsByPostQueryValidation,
  async (req: Request<ParamPost, {}, {}, Query>, res: Response<ResComments>) => {
    const { params, requestContext, query } = req;
    const comments = await postsService.getCommentsByPostId(params.id, requestContext.user?.id, query);

    if (comments) res.send(comments);
    else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  }
);

postsRouter.post(
  '/:id/comments',
  commentByPostIdValidation,
  async (req: Request<ParamPost, {}, ReqBodyCommentByPostId>, res: Response<ResComment>) => {
    const comment = await postsService.createCommentByPostId(req.params.id, req.requestContext.user!.id, req.body);

    if (comment) res.status(HTTP_STATUSES.CREATED_201).send(comment);
    else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  }
);

addLikeStatusRouter('posts', postsRouter);
