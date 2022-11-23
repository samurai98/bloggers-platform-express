import { Router, Request, Response } from 'express';

import { HTTP_STATUSES } from 'common/http-statuses';
import { Query, ResType } from 'common/types';
import { ResComment, ResComments } from 'modules/comments/comment';
import { commentsService, commentsStory } from 'modules/comments/services';
import { commentByPostIdValidation } from 'modules/comments/routes/validation';

import { ReqBodyPost, ParamPost, ReqQueryPost, ResPost, ResPosts, ReqBodyCommentByPostId } from '../post';
import { postsQueryRepository } from '../repositories';
import { postsService } from '../services/posts-service';
import { postValidation, checkBasicAuth, postsQueryValidation, commentsByPostQueryValidation } from './validation';

export const postsRouter = Router({});

postsRouter.get('/', postsQueryValidation, async (req: Request<{}, {}, {}, ReqQueryPost>, res: Response<ResPosts>) => {
  res.send(await postsQueryRepository.getPosts(req.query));
});

postsRouter.get('/:id', async (req: Request, res: Response<ResPost>) => {
  const post = await postsQueryRepository.findPostById(req.params.id);

  if (post) res.send(post);
  else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
});

postsRouter.post('/', postValidation, async (req: Request<{}, {}, ReqBodyPost>, res: Response<ResPost>) => {
  const newPost = await postsService.createPost(req.body);
  res.status(HTTP_STATUSES.CREATED_201).send(newPost);
});

postsRouter.put('/:id', postValidation, async (req: Request<ParamPost, {}, ReqBodyPost>, res: Response<ResType>) => {
  const id = req.params.id;
  const isUpdated = await postsService.updatePost(id, req.body);

  if (isUpdated) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
});

postsRouter.delete('/:id', checkBasicAuth, async (req: Request<ParamPost>, res: Response<ResType>) => {
  const isDeleted = await postsService.deletePost(req.params.id);

  if (isDeleted) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
});

postsRouter.get(
  '/:id/comments',
  commentsByPostQueryValidation,
  async (req: Request<ParamPost, {}, {}, Query>, res: Response<ResComments>) => {
    const { id: postId } = req.params;

    if (!postId || !(await postsQueryRepository.findPostById(postId))) {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
      return;
    }

    const comments = await commentsStory.getComments({ ...req.query, postId }, req.requestContext.user?.id);

    if (comments) res.send(comments);
    else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  }
);

postsRouter.post(
  '/:id/comments',
  commentByPostIdValidation,
  async (req: Request<ParamPost, {}, ReqBodyCommentByPostId>, res: Response<ResComment>) => {
    const { id: postId } = req.params;

    if (!postId || !(await postsQueryRepository.findPostById(postId))) {
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
