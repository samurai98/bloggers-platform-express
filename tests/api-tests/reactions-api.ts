import request from 'supertest';

import { app } from '../../src/index';
import { HTTP_STATUSES } from '../../src/common/http-statuses';
import { router } from '../../src/routers';
import { Post } from '../../src/modules/posts/post';
import { User } from '../../src/modules/users/user';
import { Comment } from '../../src/modules/comments/comment';
import { ReqBodyLikeStatus } from '../../src/common/types/reactions';

import { bearerAuth } from '../common/data';
import { createBlog, createComment, createPost, createUser, loginUser } from '../common/tests-helpers';
import { anyString, getErrorsMessages, getPaginationItems } from '../common/helpers';

const createdUsers: User[] = [];
const createdPosts: Post[] = [];
const createdComments: Comment[] = [];

export const testReactionsApi = () =>
  describe('Test reactions', () => {
    beforeAll(async () => {
      for (let index = 0; index < 5; index++) {
        const newUser = await createUser({ isLogin: false, validUserIndex: index });
        createdUsers.push(newUser);
      }

      const createdBlog = await createBlog();

      for (let index = 0; index < 2; index++) {
        const newPost = await createPost(createdBlog, index);
        createdPosts.push(newPost);

        await loginUser(createdUsers[index].login);

        const newComment = await createComment(createdPosts[0], createdUsers[index]);
        createdComments.push(newComment);
      }
    });

    it('Add reaction without auth. Should return 401', async () => {
      await request(app)
        .put(`${router.posts}/${createdPosts[0].id}/like-status`)
        .send({ likeStatus: 'Like' })
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);

      await request(app).get(`${router.posts}/${createdPosts[0].id}`).expect(HTTP_STATUSES.OK_200, createdPosts[0]);

      await request(app)
        .put(`${router.comments}/${createdComments[0].id}/like-status`)
        .send({ likeStatus: 'Like' })
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);

      await request(app)
        .get(`${router.comments}/${createdComments[0].id}`)
        .expect(HTTP_STATUSES.OK_200, createdComments[0]);
    });

    it('Add reaction on fakes post and comment. Should return 404', async () => {
      await request(app)
        .put(`${router.posts}/fakePostId/like-status`)
        .set(bearerAuth)
        .send({ likeStatus: 'Like' })
        .expect(HTTP_STATUSES.NOT_FOUND_404);

      await request(app)
        .put(`${router.comments}/fakeCommentId/like-status`)
        .set(bearerAuth)
        .send({ likeStatus: 'Like' })
        .expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it('Add reaction. Incorrect body cases. Should return 400 and errorsMessages', async () => {
      const postRes = await request(app)
        .put(`${router.posts}/${createdPosts[0].id}/like-status`)
        .set(bearerAuth)
        .send({ likeStatus: 'invalid' });

      expect(postRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(postRes.body).toEqual(getErrorsMessages<ReqBodyLikeStatus>('likeStatus'));
      expect(postRes.body.errorsMessages).toHaveLength(1);

      await request(app).get(`${router.posts}/${createdPosts[0].id}`).expect(HTTP_STATUSES.OK_200, createdPosts[0]);

      const commentRes = await request(app)
        .put(`${router.comments}/${createdComments[0].id}/like-status`)
        .set(bearerAuth)
        .send({ likeStatus: 'invalid' });

      expect(commentRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(commentRes.body).toEqual(getErrorsMessages<ReqBodyLikeStatus>('likeStatus'));
      expect(commentRes.body.errorsMessages).toHaveLength(1);

      await request(app)
        .get(`${router.comments}/${createdComments[0].id}`)
        .expect(HTTP_STATUSES.OK_200, createdComments[0]);
    });

    /* **** Testing Posts *** */

    it('Post reaction. Testing by one user', async () => {
      await loginUser(createdUsers[0].login);

      const postWithLike: Post = {
        ...createdPosts[1],
        extendedLikesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: 'Like',
          newestLikes: [{ login: createdUsers[0].login, addedAt: anyString, userId: createdUsers[0].id }],
        },
      };

      const url = `${router.posts}/${createdPosts[1].id}/like-status`;

      await request(app).put(url).set(bearerAuth).send({ likeStatus: 'Like' }).expect(HTTP_STATUSES.NO_CONTENT_204);
      const getRes1 = await request(app).get(`${router.posts}/${createdPosts[1].id}`).set(bearerAuth);
      expect(getRes1.statusCode).toEqual(HTTP_STATUSES.OK_200);
      expect(getRes1.body).toEqual(postWithLike);

      await request(app).put(url).set(bearerAuth).send({ likeStatus: 'Like' }).expect(HTTP_STATUSES.NO_CONTENT_204);
      const getRes2 = await request(app).get(`${router.posts}/${createdPosts[1].id}`).set(bearerAuth);
      expect(getRes2.statusCode).toEqual(HTTP_STATUSES.OK_200);
      expect(getRes2.body).toEqual(postWithLike);

      await request(app).put(url).set(bearerAuth).send({ likeStatus: 'Dislike' }).expect(HTTP_STATUSES.NO_CONTENT_204);
      const getRes3 = await request(app).get(`${router.posts}/${createdPosts[1].id}`).set(bearerAuth);
      expect(getRes3.statusCode).toEqual(HTTP_STATUSES.OK_200);
      expect(getRes3.body).toEqual({
        ...postWithLike,
        extendedLikesInfo: { likesCount: 0, dislikesCount: 1, myStatus: 'Dislike', newestLikes: [] },
      });

      await request(app).put(url).set(bearerAuth).send({ likeStatus: 'None' }).expect(HTTP_STATUSES.NO_CONTENT_204);
      const getRes4 = await request(app).get(`${router.posts}/${createdPosts[1].id}`).set(bearerAuth);
      expect(getRes4.statusCode).toEqual(HTTP_STATUSES.OK_200);
      expect(getRes4.body).toEqual({
        ...postWithLike,
        extendedLikesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None', newestLikes: [] },
      });
    });

    it('Post reaction. Testing by many users', async () => {
      const url = `${router.posts}/${createdPosts[1].id}/like-status`;

      await loginUser(createdUsers[0].login);
      await request(app).put(url).set(bearerAuth).send({ likeStatus: 'Like' }).expect(HTTP_STATUSES.NO_CONTENT_204);

      await loginUser(createdUsers[1].login);
      await request(app).put(url).set(bearerAuth).send({ likeStatus: 'Like' }).expect(HTTP_STATUSES.NO_CONTENT_204);

      await loginUser(createdUsers[2].login);
      await request(app).put(url).set(bearerAuth).send({ likeStatus: 'Like' }).expect(HTTP_STATUSES.NO_CONTENT_204);

      await loginUser(createdUsers[3].login);
      await request(app).put(url).set(bearerAuth).send({ likeStatus: 'Like' }).expect(HTTP_STATUSES.NO_CONTENT_204);

      await loginUser(createdUsers[4].login);
      await request(app).put(url).set(bearerAuth).send({ likeStatus: 'Dislike' }).expect(HTTP_STATUSES.NO_CONTENT_204);

      const getRes = await request(app).get(`${router.posts}/${createdPosts[1].id}`).set(bearerAuth);
      expect(getRes.statusCode).toEqual(HTTP_STATUSES.OK_200);
      expect(getRes.body.extendedLikesInfo.newestLikes.length).toEqual(3);
      expect(getRes.body).toEqual({
        ...createdPosts[1],
        extendedLikesInfo: {
          likesCount: 4,
          dislikesCount: 1,
          myStatus: 'Dislike',
          newestLikes: [
            { login: createdUsers[3].login, addedAt: anyString, userId: createdUsers[3].id },
            { login: createdUsers[2].login, addedAt: anyString, userId: createdUsers[2].id },
            { login: createdUsers[1].login, addedAt: anyString, userId: createdUsers[1].id },
          ],
        },
      });
    });

    /* **** Testing Comments *** */

    it('Comment reaction. Testing by one user', async () => {
      await loginUser(createdUsers[0].login);

      const commentWithLike: Comment = {
        ...createdComments[1],
        likesInfo: { likesCount: 1, dislikesCount: 0, myStatus: 'Like' },
      };

      const url = `${router.comments}/${createdComments[1].id}/like-status`;

      await request(app).put(url).set(bearerAuth).send({ likeStatus: 'Like' }).expect(HTTP_STATUSES.NO_CONTENT_204);
      await request(app)
        .get(`${router.comments}/${createdComments[1].id}`)
        .set(bearerAuth)
        .expect(HTTP_STATUSES.OK_200, commentWithLike);

      await request(app).put(url).set(bearerAuth).send({ likeStatus: 'Like' }).expect(HTTP_STATUSES.NO_CONTENT_204);
      await request(app)
        .get(`${router.comments}/${createdComments[1].id}`)
        .set(bearerAuth)
        .expect(HTTP_STATUSES.OK_200, commentWithLike);

      await request(app).put(url).set(bearerAuth).send({ likeStatus: 'Dislike' }).expect(HTTP_STATUSES.NO_CONTENT_204);
      await request(app)
        .get(`${router.comments}/${createdComments[1].id}`)
        .set(bearerAuth)
        .expect(HTTP_STATUSES.OK_200, {
          ...commentWithLike,
          likesInfo: { likesCount: 0, dislikesCount: 1, myStatus: 'Dislike' },
        });

      await request(app).put(url).set(bearerAuth).send({ likeStatus: 'None' }).expect(HTTP_STATUSES.NO_CONTENT_204);
      await request(app)
        .get(`${router.comments}/${createdComments[1].id}`)
        .set(bearerAuth)
        .expect(HTTP_STATUSES.OK_200, {
          ...commentWithLike,
          likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
        });
    });

    it('Comment reaction. Testing by many users', async () => {
      const url = `${router.comments}/${createdComments[1].id}/like-status`;

      await loginUser(createdUsers[0].login);
      await request(app)
        .put(`${router.comments}/${createdComments[0].id}/like-status`)
        .set(bearerAuth)
        .send({ likeStatus: 'Like' })
        .expect(HTTP_STATUSES.NO_CONTENT_204);

      await loginUser(createdUsers[1].login);
      await request(app).put(url).set(bearerAuth).send({ likeStatus: 'Like' }).expect(HTTP_STATUSES.NO_CONTENT_204);

      await loginUser(createdUsers[2].login);
      await request(app).put(url).set(bearerAuth).send({ likeStatus: 'Like' }).expect(HTTP_STATUSES.NO_CONTENT_204);

      await loginUser(createdUsers[3].login);
      await request(app).put(url).set(bearerAuth).send({ likeStatus: 'Like' }).expect(HTTP_STATUSES.NO_CONTENT_204);

      await loginUser(createdUsers[4].login);
      await request(app).put(url).set(bearerAuth).send({ likeStatus: 'Dislike' }).expect(HTTP_STATUSES.NO_CONTENT_204);

      const allComments = await request(app).get(`${router.posts}/${createdPosts[0].id}/comments`).set(bearerAuth);
      expect(allComments.statusCode).toEqual(HTTP_STATUSES.OK_200);
      expect(allComments.body).toEqual(
        getPaginationItems({
          pagesCount: 1,
          totalCount: 2,
          items: expect.arrayContaining([
            { ...createdComments[1], likesInfo: { likesCount: 3, dislikesCount: 1, myStatus: 'Dislike' } },
            { ...createdComments[0], likesInfo: { likesCount: 1, dislikesCount: 0, myStatus: 'None' } },
          ]),
        })
      );
    });

    afterAll(async () => {
      await request(app).delete(router.delete_all);
    });
  });
