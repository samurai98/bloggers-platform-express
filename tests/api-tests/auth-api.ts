import request from "supertest";

import { app } from "../../src/index";
import { HTTP_STATUSES } from "../../src/common/http-statuses";
import { auth_router, delete_all_router } from "../../src/routers";
import { ReqBodyAuth, ReqBodyUser, User } from "../../src/modules/users/user";
import { jwtService } from "../../src/common/services/jwt-service";
import { authPath } from "../../src/modules/auth/routes/auth-router";
import { usersQueryRepository } from "../../src/modules/users/repositories";
import { ReqBodyConfirm, ReqBodyResending } from "../../src/modules/auth/auth";

import { bearerAuth, validUsers } from "../common/data";
import { getErrorsMessages, setBearerAuth } from "../common/helpers";

let createdUser = {} as User;

export const testAuthApi = () =>
  describe("Test auth api", () => {
    it("Registration user. Incorrect body cases. Should return 400 and errorsMessages", async () => {
      const firstRes = await request(app)
        .post(`${auth_router}${authPath.registration}`)
        .send();

      expect(firstRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(firstRes.body).toEqual(
        getErrorsMessages<ReqBodyUser>("login", "password", "email")
      );
      expect(firstRes.body.errorsMessages).toHaveLength(3);

      const secondRes = await request(app)
        .post(`${auth_router}${authPath.registration}`)
        .send({ login: "valid", password: "" });

      expect(secondRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(secondRes.body).toEqual(
        getErrorsMessages<ReqBodyUser>("password", "email")
      );
      expect(secondRes.body.errorsMessages).toHaveLength(2);
    });

    it("Confirm registration. Incorrect body cases. Should return 400 and errorsMessages", async () => {
      const firstRes = await request(app)
        .post(`${auth_router}${authPath.confirmRegistration}`)
        .send();

      expect(firstRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(firstRes.body).toEqual(getErrorsMessages<ReqBodyConfirm>("code"));
      expect(firstRes.body.errorsMessages).toHaveLength(1);

      const secondRes = await request(app)
        .post(`${auth_router}${authPath.confirmRegistration}`)
        .send({ code: "not valid code" });

      expect(secondRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(secondRes.body).toEqual(getErrorsMessages<ReqBodyConfirm>("code"));
      expect(secondRes.body.errorsMessages).toHaveLength(1);
    });

    it("Registration user and confirm registration. Should return 204", async () => {
      await request(app)
        .post(`${auth_router}${authPath.registration}`)
        .send(validUsers[0])
        .expect(HTTP_STATUSES.NO_CONTENT_204);

      const userDB = await usersQueryRepository.findUserByLoginOrEmail(
        validUsers[0].email
      );

      await request(app)
        .post(`${auth_router}${authPath.confirmRegistration}`)
        .send({ code: userDB!.emailConfirmation.confirmationCode })
        .expect(HTTP_STATUSES.NO_CONTENT_204);

      createdUser = userDB!.accountData as User;
    });

    it("Login user. Should return 401", async () => {
      await request(app)
        .post(`${auth_router}${authPath.login}`)
        .send({ login: "some user", password: "123456" })
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);
    });

    it("Login user. Incorrect body cases. Should return 400 and errorsMessages", async () => {
      const firstRes = await request(app)
        .post(`${auth_router}${authPath.login}`)
        .send();

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

    it("Login user. Should return 204", async () => {
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

    it("Resending email. Incorrect body cases. Should return 400 and errorsMessages", async () => {
      const firstRes = await request(app)
        .post(`${auth_router}${authPath.resendingEmail}`)
        .send({ email: createdUser.email })
        .expect(HTTP_STATUSES.BAD_REQUEST_400);

      expect(firstRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(firstRes.body).toEqual(
        getErrorsMessages<ReqBodyResending>("email")
      );
      expect(firstRes.body.errorsMessages).toHaveLength(1);

      const secondRes = await request(app)
        .post(`${auth_router}${authPath.resendingEmail}`)
        .send()
        .expect(HTTP_STATUSES.BAD_REQUEST_400);

      expect(secondRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(secondRes.body).toEqual(
        getErrorsMessages<ReqBodyResending>("email")
      );
      expect(secondRes.body.errorsMessages).toHaveLength(1);
    });

    it("Resending email. Should return 204", async () => {
      await request(app)
        .post(`${auth_router}${authPath.registration}`)
        .send(validUsers[1])
        .expect(HTTP_STATUSES.NO_CONTENT_204);

      await request(app)
        .post(`${auth_router}${authPath.resendingEmail}`)
        .send({ email: validUsers[1].email })
        .expect(HTTP_STATUSES.NO_CONTENT_204);
    });

    afterAll(async () => {
      await request(app).delete(delete_all_router);
    });
  });
