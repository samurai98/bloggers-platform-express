import request from "supertest";

import { app } from "../../src/index";
import { HTTP_STATUSES } from "../../src/common/http-statuses";
import {
  auth_router,
  delete_all_router,
  users_router,
} from "../../src/routers";
import { ReqBodyAuth, User } from "../../src/modules/users/user";
import { jwtService } from "../../src/common/services/jwt-service";

import { basicAuth, bearerAuth, validUsers } from "../common/data";
import {
  anyString,
  dateISORegEx,
  getErrorsMessages,
  setBearerAuth,
} from "../common/helpers";

let createdUser = {} as User;

export const testAuthApi = () =>
  describe("Test auth api", () => {
    beforeAll(async () => {
      /** Creating user for next tests */
      const res = await request(app)
        .post(users_router)
        .set(basicAuth)
        .send(validUsers[0]);

      expect(res.statusCode).toEqual(HTTP_STATUSES.CREATED_201);
      expect(res.body).toEqual({
        ...validUsers[0],
        password: undefined,
        id: anyString,
        createdAt: dateISORegEx,
      });

      createdUser = { ...res.body };
    });

    it("Auth user. Should return 401", async () => {
      await request(app)
        .post(`${auth_router}/login`)
        .send({ login: "some user", password: "123456" })
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);
    });

    it("Auth user. Incorrect body cases. Should return 400 and errorsMessages", async () => {
      const firstRes = await request(app).post(`${auth_router}/login`).send();

      expect(firstRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(firstRes.body).toEqual(
        getErrorsMessages<ReqBodyAuth>("login", "password")
      );
      expect(firstRes.body.errorsMessages).toHaveLength(2);

      const secondRes = await request(app)
        .post(`${auth_router}/login`)
        .send({ login: "valid", password: "" });

      expect(secondRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(secondRes.body).toEqual(
        getErrorsMessages<ReqBodyAuth>("password")
      );
      expect(secondRes.body.errorsMessages).toHaveLength(1);
    });

    it("Auth user. Should return 204", async () => {
      const firstRes = await request(app)
        .post(`${auth_router}/login`)
        .send({ login: validUsers[0].login, password: validUsers[0].password });

      const firstExpectedToken = await jwtService.getUserIdByToken(
        firstRes.body.accessToken
      );

      expect(firstRes.statusCode).toEqual(HTTP_STATUSES.OK_200);
      expect(firstExpectedToken).toEqual(createdUser.id);

      const secondRes = await request(app)
        .post(`${auth_router}/login`)
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
        .get(`${auth_router}/me`)
        .set(bearerAuth)
        .expect(HTTP_STATUSES.OK_200, { userId, email, login });
    });

    it("Get user information (me). Should return 401", async () => {
      await request(app)
        .get(`${auth_router}/me`)
        .set({ Authorization: "Bearer fakeToken" })
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);

      await request(app)
        .get(`${auth_router}/me`)
        .set({ Authorization: "fakeBearerToken" })
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);
    });

    afterAll(async () => {
      await request(app).delete(delete_all_router);
    });
  });
