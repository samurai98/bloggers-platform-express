import request from 'supertest';

import { app } from '../../src/index';
import { HTTP_STATUSES } from '../../src/common/http-statuses';
import { router } from '../../src/routers';
import { Post, ReqBodyCommentByPostId, ReqBodyPost } from '../../src/modules/posts/post';
import { Blog } from '../../src/modules/blogs/blog';
import { Comment } from '../../src/modules/comments/comment';
import { User } from '../../src/modules/users/user';

import { getErrorsMessages, getOverMaxLength, getPaginationItems, sortByField } from '../common/helpers';
import { basicAuth, bearerAuth, incorrectQuery, validComments, validPosts } from '../common/data';
import { createBlog, createComment, createPost, createUser } from '../common/tests-helpers';

const createdPosts: Post[] = [];
const createdBlogs: Blog[] = [];
let createdUser = {} as User;

export const testPostsApi = () =>
  describe('Test posts api', () => {
    beforeAll(async () => {
      createdUser = await createUser({ isLogin: true });

      const createdBlog = await createBlog();
      createdBlogs.push(createdBlog);
    });

    it('Posts without auth. Should return 401', async () => {
      await request(app).post(router.posts).send({}).expect(HTTP_STATUSES.UNAUTHORIZED_401);
      await request(app).put(`${router.posts}/fakePostId`).send({}).expect(HTTP_STATUSES.UNAUTHORIZED_401);
      await request(app).delete(`${router.posts}/fakePostId`).expect(HTTP_STATUSES.UNAUTHORIZED_401);
    });

    it('Get posts. Should return 200 and empty array', async () => {
      await request(app).get(router.posts).expect(HTTP_STATUSES.OK_200, getPaginationItems());
    });

    it('Get posts. Incorrect query cases. Should return 200 and empty array', async () => {
      await request(app)
        .get(`${router.posts}?${incorrectQuery.empty}`)
        .expect(HTTP_STATUSES.OK_200, getPaginationItems());

      await request(app)
        .get(`${router.posts}?${incorrectQuery.incorrect}`)
        .expect(HTTP_STATUSES.OK_200, getPaginationItems());
    });

    it('Create post. Incorrect body cases. Should return 400 and errorsMessages', async () => {
      const firstRes = await request(app).post(router.posts).set(basicAuth).send();

      expect(firstRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(firstRes.body).toEqual(getErrorsMessages<ReqBodyPost>('title', 'shortDescription', 'content', 'blogId'));
      expect(firstRes.body.errorsMessages).toHaveLength(4);

      const secondRes = await request(app)
        .post(router.posts)
        .set(basicAuth)
        .send({
          title: getOverMaxLength(30),
          shortDescription: getOverMaxLength(100),
          content: getOverMaxLength(1000),
          blogId: '',
        });

      expect(secondRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(secondRes.body).toEqual(getErrorsMessages<ReqBodyPost>('title', 'shortDescription', 'content', 'blogId'));
      expect(secondRes.body.errorsMessages).toHaveLength(4);

      const thirdRes = await request(app).post(router.posts).set(basicAuth).send({ title: 'valid', content: 'valid' });

      expect(thirdRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(thirdRes.body).toEqual(getErrorsMessages<ReqBodyPost>('shortDescription', 'blogId'));
      expect(thirdRes.body.errorsMessages).toHaveLength(2);

      await request(app).get(router.posts).expect(HTTP_STATUSES.OK_200, getPaginationItems());
    });

    it('Create post. Should return 201 and new post', async () => {
      const createdPost = await createPost(createdBlogs[0]);

      createdPosts.push(createdPost);

      await request(app)
        .get(router.posts)
        .expect(HTTP_STATUSES.OK_200, getPaginationItems({ pagesCount: 1, totalCount: 1, items: [createdPost] }));
    });

    it('Create posts. Should create new posts', async () => {
      for (const post of validPosts.slice(1)) {
        const res = await request(app)
          .post(router.posts)
          .set(basicAuth)
          .send({ ...post, blogId: createdBlogs[0].id });
        createdPosts.push(res.body);
      }

      const res = await request(app).get(router.posts);

      expect(res.statusCode).toEqual(HTTP_STATUSES.OK_200);
      expect(res.body).toEqual(
        getPaginationItems({
          totalCount: validPosts.length,
          pagesCount: 1,
          items: sortByField<Post>(createdPosts, 'createdAt'),
        })
      );
    });

    it('Get posts. Query cases. Should return 200 and filtered posts', async () => {
      const sortedPosts = sortByField<Post>(createdPosts, 'title', 'asc');

      await request(app)
        .get(`${router.posts}?sortBy=title&sortDirection=asc`)
        .expect(
          HTTP_STATUSES.OK_200,
          getPaginationItems({ pagesCount: 1, totalCount: sortedPosts.length, items: sortedPosts })
        );

      await request(app)
        .get(`${router.posts}?pageNumber=2&pageSize=3`)
        .expect(
          HTTP_STATUSES.OK_200,
          getPaginationItems({
            pagesCount: 2,
            page: 2,
            pageSize: 3,
            totalCount: createdPosts.length,
            items: sortByField<Post>(createdPosts, 'createdAt').slice(-2),
          })
        );

      await request(app)
        .get(`${router.posts}?pageNumber=99`)
        .expect(HTTP_STATUSES.OK_200, getPaginationItems({ pagesCount: 1, page: 99, totalCount: createdPosts.length }));
    });

    it('Get post by id. Should return 200 and post', async () => {
      await request(app).get(`${router.posts}/${createdPosts[1].id}`).expect(HTTP_STATUSES.OK_200, createdPosts[1]);
    });

    it('Get post by id. Should return 404', async () => {
      await request(app).get(`${router.posts}/fakePostId`).expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it('Update post. Should update post and return 204', async () => {
      const updateData = {
        title: 'new title',
        content: 'update content',
        shortDescription: 'updated',
        blogId: createdBlogs[0].id,
      };

      await request(app)
        .put(`${router.posts}/${createdPosts[2].id}`)
        .set(basicAuth)
        .send(updateData)
        .expect(HTTP_STATUSES.NO_CONTENT_204);

      await request(app)
        .get(`${router.posts}/${createdPosts[2].id}`)
        .expect(HTTP_STATUSES.OK_200, { ...createdPosts[2], ...updateData });
    });

    it('Update post. Should return 404', async () => {
      await request(app)
        .put(`${router.posts}/fakePostId`)
        .set(basicAuth)
        .send({
          title: 'new title',
          content: 'update content',
          shortDescription: 'updated',
          blogId: createdBlogs[0].id,
        })
        .expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it('Update post. Incorrect body cases. Should return 400 and errorsMessages', async () => {
      const firstRes = await request(app).put(`${router.posts}/${createdPosts[3].id}`).set(basicAuth).send();

      expect(firstRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(firstRes.body).toEqual(getErrorsMessages<ReqBodyPost>('title', 'shortDescription', 'content', 'blogId'));
      expect(firstRes.body.errorsMessages).toHaveLength(4);

      const secondRes = await request(app)
        .put(`${router.posts}/${createdPosts[3].id}`)
        .set(basicAuth)
        .send({
          title: getOverMaxLength(30),
          shortDescription: getOverMaxLength(100),
          content: getOverMaxLength(1000),
          blogId: '',
        });

      expect(secondRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(secondRes.body).toEqual(getErrorsMessages<ReqBodyPost>('title', 'shortDescription', 'content', 'blogId'));
      expect(secondRes.body.errorsMessages).toHaveLength(4);

      const thirdRes = await request(app)
        .put(`${router.posts}/${createdPosts[3].id}`)
        .set(basicAuth)
        .send({ title: 'valid', content: 'valid' });

      expect(thirdRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(thirdRes.body).toEqual(getErrorsMessages<ReqBodyPost>('shortDescription', 'blogId'));
      expect(thirdRes.body.errorsMessages).toHaveLength(2);

      await request(app).get(`${router.posts}/${createdPosts[3].id}`).expect(HTTP_STATUSES.OK_200, createdPosts[3]);
    });

    it('Delete post. Should delete post and return 204', async () => {
      await request(app)
        .delete(`${router.posts}/${createdPosts[4].id}`)
        .set(basicAuth)
        .expect(HTTP_STATUSES.NO_CONTENT_204);

      await request(app).get(`${router.posts}/${createdPosts[4].id}`).expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it('Delete post. Should return 404', async () => {
      await request(app).delete(`${router.posts}/fakePostId`).set(basicAuth).expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    const createdCommentsByPostId: Comment[] = [];

    it('Create comment by postId. Should return 401', async () => {
      await request(app)
        .post(`${router.posts}/${createdPosts[0].id}/comments`)
        .send({ content: 'valid valid valid valid' })
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);
    });

    it('Create comment by postId. Should return 404', async () => {
      await request(app)
        .post(`${router.posts}/fakePostId/comments`)
        .set(bearerAuth)
        .send({ content: 'valid valid valid valid' })
        .expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it('Create comment by postId. Should return 400 and errorsMessages', async () => {
      const firstRes = await request(app).post(`${router.posts}/${createdPosts[0].id}/comments`).set(bearerAuth).send();

      expect(firstRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(firstRes.body).toEqual(getErrorsMessages<ReqBodyCommentByPostId>('content'));
      expect(firstRes.body.errorsMessages).toHaveLength(1);

      const secondRes = await request(app)
        .post(`${router.posts}/${createdPosts[0].id}/comments`)
        .set(bearerAuth)
        .send({ content: getOverMaxLength(300) });

      expect(secondRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(secondRes.body).toEqual(getErrorsMessages<ReqBodyCommentByPostId>('content'));
      expect(secondRes.body.errorsMessages).toHaveLength(1);

      const thirdRes = await request(app)
        .post(`${router.posts}/${createdPosts[0].id}/comments`)
        .set(bearerAuth)
        .send({ content: 'not valid' });

      expect(thirdRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(thirdRes.body).toEqual(getErrorsMessages<ReqBodyCommentByPostId>('content'));
      expect(thirdRes.body.errorsMessages).toHaveLength(1);

      await request(app)
        .get(`${router.posts}/${createdPosts[0].id}/comments`)
        .expect(HTTP_STATUSES.OK_200, getPaginationItems());
    });

    it('Create comment by postId. Should return 201 and new comment', async () => {
      const createdComment = await createComment(createdPosts[0], createdUser);
      createdCommentsByPostId.push(createdComment);
    });

    it('Get comments by postId. Should return 200 and 1 comment', async () => {
      await request(app)
        .get(`${router.posts}/${createdPosts[0].id}/comments`)
        .expect(
          HTTP_STATUSES.OK_200,
          getPaginationItems({ pagesCount: 1, totalCount: 1, items: createdCommentsByPostId })
        );
    });

    it('Get comments by postId. Incorrect query cases. Should return 200 and 1 comment', async () => {
      const expectedRes = getPaginationItems({ pagesCount: 1, totalCount: 1, items: createdCommentsByPostId });

      await request(app)
        .get(`${router.posts}/${createdPosts[0].id}/comments?${incorrectQuery.empty}`)
        .expect(HTTP_STATUSES.OK_200, expectedRes);

      await request(app)
        .get(`${router.posts}/${createdPosts[0].id}/comments?${incorrectQuery.incorrect}`)
        .expect(HTTP_STATUSES.OK_200, expectedRes);
    });

    it('Create comments by postId. Should create new comments', async () => {
      for (const comment of validComments.slice(1)) {
        const res = await request(app)
          .post(`${router.posts}/${createdPosts[0].id}/comments`)
          .set(bearerAuth)
          .send(comment);
        createdCommentsByPostId.push(res.body);
      }

      const res = await request(app).get(`${router.posts}/${createdPosts[0].id}/comments`);

      expect(res.statusCode).toEqual(HTTP_STATUSES.OK_200);
      expect(res.body).toEqual(
        getPaginationItems({
          totalCount: createdCommentsByPostId.length,
          pagesCount: 1,
          items: sortByField<Comment>(createdCommentsByPostId, 'createdAt'),
        })
      );
    });

    it('Get comments by postId. Query cases. Should return 200 and filtered comments', async () => {
      const sortedComments = sortByField<Comment>(createdCommentsByPostId, 'content', 'asc');

      await request(app)
        .get(`${router.posts}/${createdPosts[0].id}/comments?sortBy=content&sortDirection=asc`)
        .expect(
          HTTP_STATUSES.OK_200,
          getPaginationItems({ pagesCount: 1, totalCount: sortedComments.length, items: sortedComments })
        );

      await request(app)
        .get(`${router.posts}/${createdPosts[0].id}/comments?pageNumber=2&pageSize=3`)
        .expect(
          HTTP_STATUSES.OK_200,
          getPaginationItems({
            pagesCount: 2,
            page: 2,
            pageSize: 3,
            totalCount: createdCommentsByPostId.length,
            items: sortByField<Comment>(createdCommentsByPostId, 'createdAt').slice(-2),
          })
        );

      await request(app)
        .get(`${router.posts}/${createdPosts[0].id}/comments?pageNumber=99`)
        .expect(
          HTTP_STATUSES.OK_200,
          getPaginationItems({ pagesCount: 1, page: 99, totalCount: createdCommentsByPostId.length })
        );
    });

    it('Get comments by postId. Should return 404', async () => {
      await request(app).get(`${router.posts}/fakeBlogId/comments`).expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    afterAll(async () => {
      await request(app).delete(router.delete_all);
    });
  });
