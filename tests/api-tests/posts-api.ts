import request from "supertest";

import { app } from "../../src/index";
import { HTTP_STATUSES } from "../../src/common/http-statuses";
import {
  blogs_router,
  delete_all_router,
  posts_router,
} from "../../src/routers";
import { Post, ReqBodyPost } from "../../src/modules/posts/post";
import { Blog } from "../../src/modules/blogs/blog";

import {
  anyString,
  dateISORegEx,
  getErrorsMessages,
  getOverMaxLength,
  getPaginationItems,
  sortByField,
} from "../common/helpers";
import { auth, incorrectQuery, validBlogs, validPosts } from "../common/data";

const createdPosts: Post[] = [];
const createdBlogs: Blog[] = [];

export const testPostsApi = () =>
  describe("Test posts api", () => {
    beforeAll(async () => {
      /** Creating blog for next tests */
      const res = await request(app)
        .post(blogs_router)
        .set(auth)
        .send(validBlogs[0]);

      const createdBlog = res.body;
      expect(res.statusCode).toEqual(HTTP_STATUSES.CREATED_201);
      expect(createdBlog).toEqual({
        ...validBlogs[0],
        id: anyString,
        createdAt: dateISORegEx,
      });

      createdBlogs.push(createdBlog);
    });

    it("Posts without auth. Should return 401", async () => {
      await request(app)
        .post(posts_router)
        .send({})
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);

      await request(app)
        .put(`${posts_router}/fakePostId`)
        .send({})
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);

      await request(app)
        .delete(`${posts_router}/fakePostId`)
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);
    });

    it("Get posts. Should return 200 and empty array", async () => {
      await request(app)
        .get(posts_router)
        .expect(HTTP_STATUSES.OK_200, getPaginationItems());
    });

    it("Get posts. Incorrect query cases. Should return 200 and empty array", async () => {
      await request(app)
        .get(`${posts_router}?${incorrectQuery.empty}`)
        .expect(HTTP_STATUSES.OK_200, getPaginationItems());

      await request(app)
        .get(`${posts_router}?${incorrectQuery.incorrect}`)
        .expect(HTTP_STATUSES.OK_200, getPaginationItems());
    });

    it("Create post. Incorrect body cases. Should return 400 and errorsMessages", async () => {
      const firstRes = await request(app).post(posts_router).set(auth).send();

      expect(firstRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(firstRes.body).toEqual(
        getErrorsMessages<ReqBodyPost>(
          "title",
          "shortDescription",
          "content",
          "blogId"
        )
      );
      expect(firstRes.body.errorsMessages).toHaveLength(4);

      const secondRes = await request(app)
        .post(posts_router)
        .set(auth)
        .send({
          title: getOverMaxLength(30),
          shortDescription: getOverMaxLength(100),
          content: getOverMaxLength(1000),
          blogId: "",
        });

      expect(secondRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(secondRes.body).toEqual(
        getErrorsMessages<ReqBodyPost>(
          "title",
          "shortDescription",
          "content",
          "blogId"
        )
      );
      expect(secondRes.body.errorsMessages).toHaveLength(4);

      const thirdRes = await request(app)
        .post(posts_router)
        .set(auth)
        .send({ title: "valid", content: "valid" });

      expect(thirdRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(thirdRes.body).toEqual(
        getErrorsMessages<ReqBodyPost>("shortDescription", "blogId")
      );
      expect(thirdRes.body.errorsMessages).toHaveLength(2);

      await request(app)
        .get(posts_router)
        .expect(HTTP_STATUSES.OK_200, getPaginationItems());
    });

    it("Create post. Should return 201 and new post", async () => {
      const newPost = { ...validPosts[0], blogId: createdBlogs[0].id };

      const res = await request(app).post(posts_router).set(auth).send(newPost);
      const createdPost = res.body;

      expect(res.statusCode).toEqual(HTTP_STATUSES.CREATED_201);
      expect(createdPost).toEqual({
        ...newPost,
        id: anyString,
        createdAt: dateISORegEx,
        blogName: createdBlogs[0].name,
      });

      createdPosts.push(createdPost);

      await request(app)
        .get(posts_router)
        .expect(
          HTTP_STATUSES.OK_200,
          getPaginationItems({
            pagesCount: 1,
            totalCount: 1,
            items: [createdPost],
          })
        );
    });

    it("Create posts. Should create new posts", async () => {
      for (const post of validPosts.slice(1)) {
        const res = await request(app)
          .post(posts_router)
          .set(auth)
          .send({ ...post, blogId: createdBlogs[0].id });
        createdPosts.push(res.body);
      }

      const res = await request(app).get(posts_router);

      expect(res.statusCode).toEqual(HTTP_STATUSES.OK_200);
      expect(res.body).toEqual(
        getPaginationItems({
          totalCount: validPosts.length,
          pagesCount: 1,
          items: sortByField<Post>(createdPosts, "createdAt"),
        })
      );
    });

    it("Get posts. Query cases. Should return 200 and filtered posts", async () => {
      const sortedPosts = sortByField<Post>(createdPosts, "title", "asc");

      await request(app)
        .get(`${posts_router}?sortBy=title&sortDirection=asc`)
        .expect(
          HTTP_STATUSES.OK_200,
          getPaginationItems({
            pagesCount: 1,
            totalCount: sortedPosts.length,
            items: sortedPosts,
          })
        );

      await request(app)
        .get(`${posts_router}?pageNumber=2&pageSize=3`)
        .expect(
          HTTP_STATUSES.OK_200,
          getPaginationItems({
            pagesCount: 2,
            page: 2,
            pageSize: 3,
            totalCount: createdPosts.length,
            items: sortByField<Post>(createdPosts, "createdAt").slice(-2),
          })
        );

      await request(app)
        .get(`${posts_router}?pageNumber=99`)
        .expect(
          HTTP_STATUSES.OK_200,
          getPaginationItems({
            pagesCount: 1,
            page: 99,
            totalCount: createdPosts.length,
          })
        );
    });

    it("Get post by id. Should return 200 and post", async () => {
      await request(app)
        .get(`${posts_router}/${createdPosts[1].id}`)
        .expect(HTTP_STATUSES.OK_200, createdPosts[1]);
    });

    it("Get post by id. Should return 404", async () => {
      await request(app)
        .get(`${posts_router}/fakePostId`)
        .expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it("Update post. Should update post and return 204", async () => {
      const updateData = {
        title: "new title",
        content: "update content",
        shortDescription: "updated",
        blogId: createdBlogs[0].id,
      };

      await request(app)
        .put(`${posts_router}/${createdPosts[2].id}`)
        .set(auth)
        .send(updateData)
        .expect(HTTP_STATUSES.NO_CONTENT_204);

      await request(app)
        .get(`${posts_router}/${createdPosts[2].id}`)
        .expect(HTTP_STATUSES.OK_200, { ...createdPosts[2], ...updateData });
    });

    it("Update post. Should return 404", async () => {
      await request(app)
        .put(`${posts_router}/fakePostId`)
        .set(auth)
        .send({
          title: "new title",
          content: "update content",
          shortDescription: "updated",
          blogId: createdBlogs[0].id,
        })
        .expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it("Update post. Incorrect body cases. Should return 400 and errorsMessages", async () => {
      const firstRes = await request(app)
        .put(`${posts_router}/${createdPosts[3].id}`)
        .set(auth)
        .send();

      expect(firstRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(firstRes.body).toEqual(
        getErrorsMessages<ReqBodyPost>(
          "title",
          "shortDescription",
          "content",
          "blogId"
        )
      );
      expect(firstRes.body.errorsMessages).toHaveLength(4);

      const secondRes = await request(app)
        .put(`${posts_router}/${createdPosts[3].id}`)
        .set(auth)
        .send({
          title: getOverMaxLength(30),
          shortDescription: getOverMaxLength(100),
          content: getOverMaxLength(1000),
          blogId: "",
        });

      expect(secondRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(secondRes.body).toEqual(
        getErrorsMessages<ReqBodyPost>(
          "title",
          "shortDescription",
          "content",
          "blogId"
        )
      );
      expect(secondRes.body.errorsMessages).toHaveLength(4);

      const thirdRes = await request(app)
        .put(`${posts_router}/${createdPosts[3].id}`)
        .set(auth)
        .send({ title: "valid", content: "valid" });

      expect(thirdRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(thirdRes.body).toEqual(
        getErrorsMessages<ReqBodyPost>("shortDescription", "blogId")
      );
      expect(thirdRes.body.errorsMessages).toHaveLength(2);

      await request(app)
        .get(`${posts_router}/${createdPosts[3].id}`)
        .expect(HTTP_STATUSES.OK_200, createdPosts[3]);
    });

    it("Delete post. Should delete post and return 204", async () => {
      await request(app)
        .delete(`${posts_router}/${createdPosts[4].id}`)
        .set(auth)
        .expect(HTTP_STATUSES.NO_CONTENT_204);

      await request(app)
        .get(`${posts_router}/${createdPosts[4].id}`)
        .expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it("Delete post. Should return 404", async () => {
      await request(app)
        .delete(`${posts_router}/fakePostId`)
        .set(auth)
        .expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    afterAll(async () => {
      await request(app).delete(delete_all_router);
    });
  });
