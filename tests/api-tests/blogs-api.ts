import request from "supertest";

import { app } from "../../src/index";
import { HTTP_STATUSES } from "../../src/common/http-statuses";
import { blogs_router, posts_router } from "../../src/routers";
import {
  Blog,
  ReqBodyBlog,
  ReqBodyPostByBlogId,
} from "../../src/modules/blogs/blog";
import { Post } from "../../src/modules/posts/post";

import { incorrectQuery, auth, validBlogs } from "../common/data";
import {
  anyString,
  dateISORegEx,
  getErrorsMessages,
  getOverMaxLength,
  getPaginationItems,
  sortByField,
} from "../common/helpers";

const createdBlogs: Blog[] = [];

export const testBlogsApi = () =>
  describe("Test blogs api", () => {
    it("Blogs without auth. Should return 401", async () => {
      await request(app)
        .post(blogs_router)
        .send({})
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);

      await request(app)
        .post(`${blogs_router}/fakeBlogId/posts`)
        .send({})
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);

      await request(app)
        .put(`${blogs_router}/fakeBlogId`)
        .send({})
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);

      await request(app)
        .delete(`${blogs_router}/fakeBlogId`)
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);
    });

    it("Get blogs. Should return 200 and empty array", async () => {
      await request(app)
        .get(blogs_router)
        .expect(HTTP_STATUSES.OK_200, getPaginationItems());
    });

    it("Get blogs. Incorrect query cases. Should return 200 and empty array", async () => {
      await request(app)
        .get(`${blogs_router}?${incorrectQuery.empty}&searchNameTerm=`)
        .expect(HTTP_STATUSES.OK_200, getPaginationItems());

      await request(app)
        .get(`${blogs_router}?${incorrectQuery.incorrect}searchNameTerm[]=`)
        .expect(HTTP_STATUSES.OK_200, getPaginationItems());
    });

    it("Create blog. Incorrect body cases. Should return 400 and errorsMessages", async () => {
      const firstRes = await request(app).post(blogs_router).set(auth).send();

      expect(firstRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(firstRes.body).toEqual(
        getErrorsMessages<ReqBodyBlog>("name", "youtubeUrl")
      );

      const secondRes = await request(app)
        .post(blogs_router)
        .set(auth)
        .send({
          name: getOverMaxLength(15),
          youtubeUrl: getOverMaxLength(100),
        });

      expect(secondRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(secondRes.body).toEqual(
        getErrorsMessages<ReqBodyBlog>("name", "youtubeUrl")
      );

      const thirdRes = await request(app)
        .post(blogs_router)
        .set(auth)
        .send({ name: "valid", youtubeUrl: "https://badurl" });

      expect(thirdRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(thirdRes.body).toEqual(
        getErrorsMessages<ReqBodyBlog>("youtubeUrl")
      );

      await request(app)
        .get(blogs_router)
        .expect(HTTP_STATUSES.OK_200, getPaginationItems());
    });

    it("Create blog. Should return 201 and new blog", async () => {
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

      await request(app)
        .get(blogs_router)
        .expect(
          HTTP_STATUSES.OK_200,
          getPaginationItems({
            pagesCount: 1,
            totalCount: 1,
            items: [createdBlog],
          })
        );
    });

    it("Create blogs. Should create new blogs", async () => {
      const requests = validBlogs
        .slice(1)
        .map((blog) => request(app).post(blogs_router).set(auth).send(blog));

      const responses = await Promise.all(requests);

      responses.forEach((res) => createdBlogs.push(res.body));

      const res = await request(app).get(blogs_router);

      expect(res.statusCode).toEqual(HTTP_STATUSES.OK_200);
      expect(res.body).toEqual(
        getPaginationItems({
          totalCount: validBlogs.length,
          pagesCount: 1,
          items: sortByField<Blog>(createdBlogs, "createdAt"),
        })
      );
    });

    it("Get blogs. Query cases. Should return 200 and filtered blogs", async () => {
      const filteredBlogs = createdBlogs.filter((blog) =>
        blog.name.match(/bl/i)
      );
      const sortedBlogs = sortByField<Blog>(filteredBlogs, "youtubeUrl", "asc");

      await request(app)
        .get(
          `${blogs_router}?searchNameTerm=bl&sortBy=youtubeUrl&sortDirection=asc`
        )
        .expect(
          HTTP_STATUSES.OK_200,
          getPaginationItems({
            pagesCount: 1,
            totalCount: sortedBlogs.length,
            items: sortedBlogs,
          })
        );

      await request(app)
        .get(`${blogs_router}?pageNumber=2&pageSize=3`)
        .expect(
          HTTP_STATUSES.OK_200,
          getPaginationItems({
            pagesCount: 2,
            page: 2,
            pageSize: 3,
            totalCount: createdBlogs.length,
            items: sortByField<Blog>(createdBlogs, "createdAt").slice(-2),
          })
        );

      await request(app)
        .get(`${blogs_router}?pageNumber=99`)
        .expect(
          HTTP_STATUSES.OK_200,
          getPaginationItems({
            pagesCount: 1,
            page: 99,
            totalCount: createdBlogs.length,
          })
        );
    });

    it("Get blog by id. Should return 200 and blog", async () => {
      await request(app)
        .get(`${blogs_router}/${createdBlogs[0].id}`)
        .expect(HTTP_STATUSES.OK_200, createdBlogs[0]);
    });

    it("Get blog by id. Should return 404", async () => {
      await request(app)
        .get(`${blogs_router}/fakeBlogId`)
        .expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it("Update blog. Should update blog and return 204", async () => {
      const updateData = { name: "Updated", youtubeUrl: "https://new.url" };

      await request(app)
        .put(`${blogs_router}/${createdBlogs[1].id}`)
        .set(auth)
        .send(updateData)
        .expect(HTTP_STATUSES.NO_CONTENT_204);

      await request(app)
        .get(`${blogs_router}/${createdBlogs[1].id}`)
        .expect(HTTP_STATUSES.OK_200, { ...createdBlogs[1], ...updateData });
    });

    it("Update blog. Should return 404", async () => {
      await request(app)
        .put(`${blogs_router}/fakeBlogId`)
        .set(auth)
        .send({ name: "Updated", youtubeUrl: "https://new.url" })
        .expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it("Update blog. Incorrect body cases. Should return 400 and errorsMessages", async () => {
      const firstRes = await request(app)
        .put(`${blogs_router}/${createdBlogs[2].id}`)
        .set(auth)
        .send();

      expect(firstRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(firstRes.body).toEqual(
        getErrorsMessages<ReqBodyBlog>("name", "youtubeUrl")
      );

      const secondRes = await request(app)
        .put(`${blogs_router}/${createdBlogs[2].id}`)
        .set(auth)
        .send({
          name: getOverMaxLength(15),
          youtubeUrl: getOverMaxLength(100),
        });

      expect(secondRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(secondRes.body).toEqual(
        getErrorsMessages<ReqBodyBlog>("name", "youtubeUrl")
      );

      const thirdRes = await request(app)
        .put(`${blogs_router}/${createdBlogs[2].id}`)
        .set(auth)
        .send({ name: "valid", youtubeUrl: "https://badurl" });

      expect(thirdRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(thirdRes.body).toEqual(
        getErrorsMessages<ReqBodyBlog>("youtubeUrl")
      );

      await request(app)
        .get(`${blogs_router}/${createdBlogs[2].id}`)
        .expect(HTTP_STATUSES.OK_200, createdBlogs[2]);
    });

    it("Delete blog. Should delete blog and return 204", async () => {
      await request(app)
        .delete(`${blogs_router}/${createdBlogs[3].id}`)
        .set(auth)
        .expect(HTTP_STATUSES.NO_CONTENT_204);

      await request(app)
        .get(`${blogs_router}/${createdBlogs[3].id}`)
        .expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it("Delete blog. Should return 404", async () => {
      await request(app)
        .delete(`${blogs_router}/fakeBlogId`)
        .set(auth)
        .expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    let createdPostByBlogId = {} as Post;

    it("Create post by blogId. Should return 404", async () => {
      await request(app)
        .post(`${blogs_router}/fakeBlogId/posts`)
        .set(auth)
        .send({ title: "valid", shortDescription: "valid", content: "valid" })
        .expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it("Create post by blogId. Should return 400 and errorsMessages", async () => {
      const firstRes = await request(app)
        .post(`${blogs_router}/${createdBlogs[0].id}/posts`)
        .set(auth)
        .send();

      expect(firstRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(firstRes.body).toEqual(
        getErrorsMessages<ReqBodyPostByBlogId>(
          "title",
          "shortDescription",
          "content"
        )
      );

      const secondRes = await request(app)
        .post(`${blogs_router}/${createdBlogs[0].id}/posts`)
        .set(auth)
        .send({
          title: getOverMaxLength(30),
          shortDescription: getOverMaxLength(100),
          content: getOverMaxLength(1000),
        });

      expect(secondRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(secondRes.body).toEqual(
        getErrorsMessages<ReqBodyPostByBlogId>(
          "title",
          "shortDescription",
          "content"
        )
      );

      const thirdRes = await request(app)
        .post(`${blogs_router}/${createdBlogs[0].id}/posts`)
        .set(auth)
        .send({ title: "valid", shortDescription: "" });

      expect(thirdRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(thirdRes.body).toEqual(
        getErrorsMessages<ReqBodyPostByBlogId>("shortDescription", "content")
      );

      await request(app)
        .get(`${blogs_router}/${createdBlogs[0].id}/posts`)
        .expect(HTTP_STATUSES.OK_200, getPaginationItems());
    });

    it("Create post by blogId. Should return 201 and new post", async () => {
      const post = { title: "tit", shortDescription: "desc", content: "cont" };
      const res = await request(app)
        .post(`${blogs_router}/${createdBlogs[0].id}/posts`)
        .set(auth)
        .send(post);

      createdPostByBlogId = res.body;

      expect(res.statusCode).toEqual(HTTP_STATUSES.CREATED_201);
      expect(createdPostByBlogId).toEqual({
        ...post,
        id: anyString,
        blogId: createdBlogs[0].id,
        blogName: createdBlogs[0].name,
        createdAt: dateISORegEx,
      });
    });

    it("Get posts by blogId. Should return 200 and 1 post", async () => {
      await request(app)
        .get(`${blogs_router}/${createdBlogs[0].id}/posts`)
        .expect(
          HTTP_STATUSES.OK_200,
          getPaginationItems({
            pagesCount: 1,
            totalCount: 1,
            items: [createdPostByBlogId],
          })
        );
    });

    it("Get posts by blogId. Incorrect query cases. Should return 200 and 1 post", async () => {
      const expectedRes = getPaginationItems({
        pagesCount: 1,
        totalCount: 1,
        items: [createdPostByBlogId],
      });

      await request(app)
        .get(
          `${blogs_router}/${createdBlogs[0].id}/posts?${incorrectQuery.empty}`
        )
        .expect(HTTP_STATUSES.OK_200, expectedRes);

      await request(app)
        .get(
          `${blogs_router}/${createdBlogs[0].id}/posts?${incorrectQuery.incorrect}`
        )
        .expect(HTTP_STATUSES.OK_200, expectedRes);
    });

    it("Get posts by blogId. Should return 404", async () => {
      await request(app)
        .get(`${blogs_router}/fakeBlogId/posts`)
        .expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it("Delete post. Should return 204", async () => {
      await request(app)
        .delete(`${posts_router}/${createdPostByBlogId.id}`)
        .set(auth)
        .expect(HTTP_STATUSES.NO_CONTENT_204);
    });
  });
