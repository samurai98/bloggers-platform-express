import request from "supertest";

import { app } from "../../src/index";
import { HTTP_STATUSES } from "../../src/common/http-statuses";
import { auth_router } from "../../src/routers";
import { ReqBodyAuth } from "../../src/modules/users/user";

import { validUsers } from "../common/data";
import { getErrorsMessages } from "../common/helpers";

export const testAuthApi = () =>
  describe("Test auth api", () => {
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

      const secondRes = await request(app)
        .post(`${auth_router}/login`)
        .send({ login: "valid", password: "" });

      expect(secondRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(secondRes.body).toEqual(
        getErrorsMessages<ReqBodyAuth>("password")
      );
    });

    it("Auth user. Should return 204", async () => {
      await request(app)
        .post(`${auth_router}/login`)
        .send({ login: validUsers[0].login, password: validUsers[0].password })
        .expect(HTTP_STATUSES.NO_CONTENT_204);

      await request(app)
        .post(`${auth_router}/login`)
        .send({ login: validUsers[0].email, password: validUsers[0].password })
        .expect(HTTP_STATUSES.NO_CONTENT_204);
    });
  });
