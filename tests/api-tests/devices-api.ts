import request from "supertest";

import { app } from "../../src/index";
import { HTTP_STATUSES } from "../../src/common/http-statuses";
import { router } from "../../src/routers";
import { User } from "../../src/modules/users/user";

import { bearerAuth, validUsers } from "../common/data";
import { anyString, setBearerAuth } from "../common/helpers";
import { createUser } from "../common/tests-helpers";
import { authPath } from "../../src/modules/auth/routes/auth-router";
import { Device } from "../../src/modules/auth/auth";

const expectedIp = "::ffff:127.0.0.1";

let createdUser = {} as User;
let createdSession = [] as Device[];

export const testDevicesApi = () =>
  describe("Test securityDevices api", () => {
    beforeAll(async () => {
      // create user and create 4 sessions for next tests
      createdUser = await createUser({ isLogin: true });

      await request(app).post(`${router.auth}${authPath.login}`).send({
        loginOrEmail: validUsers[0].email,
        password: validUsers[0].password,
      });
      await request(app).post(`${router.auth}${authPath.login}`).send({
        loginOrEmail: validUsers[0].email,
        password: validUsers[0].password,
      });

      const loginRes = await request(app)
        .post(`${router.auth}${authPath.login}`)
        .send({
          loginOrEmail: validUsers[0].email,
          password: validUsers[0].password,
        });

      expect(loginRes.statusCode).toEqual(HTTP_STATUSES.OK_200);

      setBearerAuth(
        loginRes.body.accessToken,
        loginRes.header["set-cookie"][0]
      );
    });

    it("Get devices by id. Should return 200 and active sessions", async () => {
      const res = await request(app)
        .get(router.securityDevices)
        .set(bearerAuth);

      expect(res.statusCode).toEqual(HTTP_STATUSES.OK_200);
      expect(res.body).toEqual(
        expect.arrayContaining([
          {
            ip: expectedIp,
            deviceId: anyString,
            title: anyString,
            lastActiveDate: anyString,
          },
        ])
      );
      expect(res.body.length).toEqual(4);

      createdSession = res.body;
    });

    it("Delete device by id. Should return 404", async () => {
      await request(app)
        .delete(`${router.securityDevices}/fakeDeviceId`)
        .set(bearerAuth)
        .expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it("Delete device by id. Should return 204", async () => {
      await request(app)
        .delete(`${router.securityDevices}/${createdSession[0].deviceId}`)
        .set(bearerAuth)
        .expect(HTTP_STATUSES.NO_CONTENT_204);

      const res = await request(app)
        .get(router.securityDevices)
        .set(bearerAuth);

      expect(res.statusCode).toEqual(HTTP_STATUSES.OK_200);
      expect(res.body).toEqual(expect.arrayContaining(createdSession.slice(1)));
      expect(res.body.length).toEqual(3);
    });

    it("Delete all devices exclude current. Should return 204", async () => {
      await request(app)
        .delete(router.securityDevices)
        .set(bearerAuth)
        .expect(HTTP_STATUSES.NO_CONTENT_204);

      await request(app)
        .get(router.securityDevices)
        .set(bearerAuth)
        .expect(HTTP_STATUSES.OK_200, [createdSession[3]]);
    });

    it("Delete device by id. Should return 403", async () => {
      await createUser({ validUserIndex: 1, isLogin: true });

      await request(app)
        .delete(`${router.securityDevices}/${createdSession[3].deviceId}`)
        .set(bearerAuth)
        .expect(HTTP_STATUSES.FORBIDDEN_403);
    });

    afterAll(async () => {
      await request(app).delete(router.delete_all);
    });
  });
