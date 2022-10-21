import request from "supertest";
import { app } from "../../../src/index";
import { delete_all_router } from "../../../src/routers";

import { testBlogsApi } from "../../api-tests/blogs-api";
import { testPostsApi } from "../../api-tests/posts-api";

describe("Test API", () => {
  beforeAll(async () => {
    await request(app).delete(delete_all_router);
  });

  testBlogsApi();
  testPostsApi();
});
