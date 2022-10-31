import request from "supertest";

import { app } from "../../src/index";
import { HTTP_STATUSES } from "../../src/common/http-statuses";
import { auth_router, delete_all_router } from "../../src/routers";
import { ReqBodyAuth, User } from "../../src/modules/users/user";
import { jwtService } from "../../src/common/services/jwt-service";
import { authPath } from "../../src/modules/auth/routes/auth-router";

import { bearerAuth, validUsers } from "../common/data";
import { getErrorsMessages, setBearerAuth } from "../common/helpers";
import { createUser } from "../common/tests-helpers";

let createdUser = {} as User;

export const testAuthApi = () =>
  describe("Test auth api", () => {
    beforeAll(async () => {
      createdUser = await createUser({ isLogin: false });
    });

    it("Auth user. Should return 401", async () => {
      await request(app)
        .post(`${auth_router}${authPath.login}`)
        .send({ login: "some user", password: "123456" })
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);
    });

    it("Auth user. Incorrect body cases. Should return 400 and errorsMessages", async () => {
      const firstRes = await request(app).post(`${auth_router}${authPath.login}`).send();

      expect(firstRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(firstRes.body).toEqual(
        getErrorsMessages<ReqBodyAuth>("login", "password")
      );
      expect(firstRes.body.errorsMessages).toHaveLength(2);

      const secondRes = await request(app)
        .post(`${auth_router}${authPath.login}`)
        .send({ login: "valid", password: "" });

      expect(secondRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(secondRes.body).toEqual(
        getErrorsMessages<ReqBodyAuth>("password")
      );
      expect(secondRes.body.errorsMessages).toHaveLength(1);
    });

    it("Auth user. Should return 204", async () => {
      const firstRes = await request(app)
        .post(`${auth_router}${authPath.login}`)
        .send({ login: validUsers[0].login, password: validUsers[0].password });

      const firstExpectedToken = await jwtService.getUserIdByToken(
        firstRes.body.accessToken
      );

      expect(firstRes.statusCode).toEqual(HTTP_STATUSES.OK_200);
      expect(firstExpectedToken).toEqual(createdUser.id);

      const secondRes = await request(app)
        .post(`${auth_router}${authPath.login}`)
        .send({ login: validUsers[0].email, password: validUsers[0].password });

      const secondExpectedToken = await jwtService.getUserIdByToken(
        secondRes.body.accessToken
      );

      expect(secondRes.statusCode).toEqual(HTTP_STATUSES.OK_200);
      expect(secondExpectedToken).toEqual(createdUser.id);

      setBearerAuth(secondRes.body.accessToken);
    });

    it("Get user information (me). Should return 200 and user information", async () => {
      const { id: userId, email, login } = createdUser;

      await request(app)
        .get(`${auth_router}${authPath.me}`)
        .set(bearerAuth)
        .expect(HTTP_STATUSES.OK_200, { userId, email, login });
    });

    it("Get user information (me). Should return 401", async () => {
      await request(app)
        .get(`${auth_router}${authPath.me}`)
        .set({ Authorization: "Bearer fakeToken" })
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);

      await request(app)
        .get(`${auth_router}${authPath.me}`)
        .set({ Authorization: "fakeBearerToken" })
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);
    });

    afterAll(async () => {
      await request(app).delete(delete_all_router);
    });
  });
