import request from 'supertest';

import { app } from '../../src/index';
import { HTTP_STATUSES } from '../../src/common/http-statuses';
import { router } from '../../src/routers';
import { Comment, ReqBodyComment } from '../../src/modules/comments/comment';
import { Blog } from '../../src/modules/blogs/blog';
import { Post } from '../../src/modules/posts/post';
import { User } from '../../src/modules/users/user';

import { bearerAuth } from '../common/data';
import { getErrorsMessages, getOverMaxLength } from '../common/helpers';
import { createBlog, createComment, createPost, createUser } from '../common/tests-helpers';

let createdUser = {} as User;
let createdBlog = {} as Blog;
let createdPost = {} as Post;
let createdComment = {} as Comment;

export const testCommentsApi = () =>
  describe('Test comments api', () => {
    beforeAll(async () => {
      createdUser = await createUser({ isLogin: true });
      createdBlog = await createBlog();
      createdPost = await createPost(createdBlog);
      createdComment = await createComment(createdPost, createdUser);
    });

    it('Comments without auth. Should return 401', async () => {
      await request(app).put(`${router.comments}/fakeCommentId`).send({}).expect(HTTP_STATUSES.UNAUTHORIZED_401);
      await request(app).delete(`${router.comments}/fakeCommentId`).expect(HTTP_STATUSES.UNAUTHORIZED_401);
    });

    it('Get comment by id. Should return 200 and comment', async () => {
      await request(app).get(`${router.comments}/${createdComment.id}`).expect(HTTP_STATUSES.OK_200, createdComment);
    });

    it('Get comment by id. Should return 404', async () => {
      await request(app).get(`${router.comments}/fakeCommentId`).expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it('Update comment. Should return 404', async () => {
      await request(app)
        .put(`${router.comments}/fakeCommentId`)
        .set(bearerAuth)
        .send({ content: 'Updated comment content' })
        .expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it('Update comment. Incorrect body cases. Should return 400 and errorsMessages', async () => {
      const firstRes = await request(app).put(`${router.comments}/${createdComment.id}`).set(bearerAuth).send();

      expect(firstRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(firstRes.body).toEqual(getErrorsMessages<ReqBodyComment>('content'));
      expect(firstRes.body.errorsMessages).toHaveLength(1);

      const secondRes = await request(app)
        .put(`${router.comments}/${createdComment.id}`)
        .set(bearerAuth)
        .send({ content: getOverMaxLength(300) });

      expect(secondRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(secondRes.body).toEqual(getErrorsMessages<ReqBodyComment>('content'));
      expect(secondRes.body.errorsMessages).toHaveLength(1);

      const thirdRes = await request(app)
        .put(`${router.comments}/${createdComment.id}`)
        .set(bearerAuth)
        .send({ content: 'Short' });

      expect(thirdRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(thirdRes.body).toEqual(getErrorsMessages<ReqBodyComment>('content'));
      expect(thirdRes.body.errorsMessages).toHaveLength(1);

      await request(app).get(`${router.comments}/${createdComment.id}`).expect(HTTP_STATUSES.OK_200, createdComment);
    });

    it('Update comment. Should update comment and return 204', async () => {
      const updateData = { content: 'Updated comment content' };

      await request(app)
        .put(`${router.comments}/${createdComment.id}`)
        .set(bearerAuth)
        .send(updateData)
        .expect(HTTP_STATUSES.NO_CONTENT_204);

      await request(app)
        .get(`${router.comments}/${createdComment.id}`)
        .expect(HTTP_STATUSES.OK_200, { ...createdComment, ...updateData });
    });

    it('Delete comment. Should return 404', async () => {
      await request(app).delete(`${router.comments}/fakeCommentId`).set(bearerAuth).expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it('Delete comment. Should delete comment and return 204', async () => {
      await request(app)
        .delete(`${router.comments}/${createdComment.id}`)
        .set(bearerAuth)
        .expect(HTTP_STATUSES.NO_CONTENT_204);

      await request(app).get(`${router.comments}/${createdComment.id}`).expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it('Update and delete comment another user. Should return 403', async () => {
      createdComment = await createComment(createdPost, createdUser);
      createdUser = await createUser({ isLogin: true, validUserIndex: 1 });

      await request(app)
        .put(`${router.comments}/${createdComment.id}`)
        .set(bearerAuth)
        .send({ content: 'Updated comment content' })
        .expect(HTTP_STATUSES.FORBIDDEN_403);

      await request(app)
        .delete(`${router.comments}/${createdComment.id}`)
        .set(bearerAuth)
        .expect(HTTP_STATUSES.FORBIDDEN_403);

      await request(app).get(`${router.comments}/${createdComment.id}`).expect(HTTP_STATUSES.OK_200, createdComment);
    });

    afterAll(async () => {
      await request(app).delete(router.delete_all);
    });
  });
