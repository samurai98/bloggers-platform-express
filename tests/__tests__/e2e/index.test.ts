import request from "supertest";
import { app } from "../../../src/index";
import { router } from "../../../src/routers";

import { testBlogsApi } from "../../api-tests/blogs-api";
import { testPostsApi } from "../../api-tests/posts-api";
import { testCommentsApi } from "../../api-tests/comments-api";
import { testUsersApi } from "../../api-tests/users-api";
import { testAuthApi } from "../../api-tests/auth-api";
import { testDevicesApi } from "../../api-tests/devices-api";

describe("Test API", () => {
  beforeAll(async () => {
    await request(app).delete(router.delete_all);
  });

  testBlogsApi();
  testPostsApi();
  testCommentsApi();
  testUsersApi();
  testAuthApi();
  testDevicesApi();
});
