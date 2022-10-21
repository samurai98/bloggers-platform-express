import request from "supertest";

import { app } from "../../src/index";
import { HTTP_STATUSES } from "../../src/common/http-statuses";
import { posts_router } from "../../src/routers";
import { Post } from "../../src/modules/posts/post";

const createdPosts: Post[] = [];

export const testPostsApi = () =>
  describe("Test posts api", () => {
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
  });
