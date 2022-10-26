import request from "supertest";

import { app } from "../../src/index";
import { HTTP_STATUSES } from "../../src/common/http-statuses";
import { delete_all_router, users_router } from "../../src/routers";
import { User, ReqBodyUser } from "../../src/modules/users/user";

import { incorrectQuery, basicAuth, validUsers } from "../common/data";
import {
  anyString,
  dateISORegEx,
  getErrorsMessages,
  getOverMaxLength,
  getPaginationItems,
  sortByField,
} from "../common/helpers";

const createdUsers: User[] = [];

export const testUsersApi = () =>
  describe("Test users api", () => {
    it("Users without auth. Should return 401", async () => {
      await request(app)
        .post(users_router)
        .send({})
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);

      await request(app)
        .delete(`${users_router}/fakeUserId`)
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);
    });

    it("Get users. Should return 200 and empty array", async () => {
      await request(app)
        .get(users_router)
        .expect(HTTP_STATUSES.OK_200, getPaginationItems());
    });

    it("Get users. Incorrect query cases. Should return 200 and empty array", async () => {
      await request(app)
        .get(
          `${users_router}?${incorrectQuery.empty}&searchLoginTerm=&searchEmailTerm=`
        )
        .expect(HTTP_STATUSES.OK_200, getPaginationItems());

      await request(app)
        .get(
          `${users_router}?${incorrectQuery.incorrect}&searchLoginTerm[]=&searchEmailTerm[]=`
        )
        .expect(HTTP_STATUSES.OK_200, getPaginationItems());
    });

    it("Create user. Incorrect body cases. Should return 400 and errorsMessages", async () => {
      const firstRes = await request(app).post(users_router).set(basicAuth).send();

      expect(firstRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(firstRes.body).toEqual(
        getErrorsMessages<ReqBodyUser>("login", "email", "password")
      );
      expect(firstRes.body.errorsMessages).toHaveLength(3);

      const secondRes = await request(app)
        .post(users_router)
        .set(basicAuth)
        .send({
          email: "pochta@gmailcom",
          login: getOverMaxLength(10),
          password: getOverMaxLength(20),
        });

      expect(secondRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(secondRes.body).toEqual(
        getErrorsMessages<ReqBodyUser>("login", "email", "password")
      );
      expect(secondRes.body.errorsMessages).toHaveLength(3);

      const thirdRes = await request(app)
        .post(users_router)
        .set(basicAuth)
        .send({ email: "valid@gmail.com", login: "12", password: "12345" });

      expect(thirdRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(thirdRes.body).toEqual(
        getErrorsMessages<ReqBodyUser>("login", "password")
      );
      expect(thirdRes.body.errorsMessages).toHaveLength(2);

      await request(app)
        .get(users_router)
        .expect(HTTP_STATUSES.OK_200, getPaginationItems());
    });

    it("Create user. Should return 201 and new user", async () => {
      const res = await request(app)
        .post(users_router)
        .set(basicAuth)
        .send(validUsers[0]);

      const createdUser = res.body;

      expect(res.statusCode).toEqual(HTTP_STATUSES.CREATED_201);
      expect(createdUser).toEqual({
        ...validUsers[0],
        password: undefined,
        id: anyString,
        createdAt: dateISORegEx,
      });

      createdUsers.push(createdUser);

      await request(app)
        .get(users_router)
        .expect(
          HTTP_STATUSES.OK_200,
          getPaginationItems({
            pagesCount: 1,
            totalCount: 1,
            items: [createdUser],
          })
        );
    });

    it("Create users. Should create new users", async () => {
      for (const user of validUsers.slice(1)) {
        const res = await request(app).post(users_router).set(basicAuth).send(user);
        createdUsers.push(res.body);
      }

      const res = await request(app).get(users_router);

      expect(res.statusCode).toEqual(HTTP_STATUSES.OK_200);
      expect(res.body).toEqual(
        getPaginationItems({
          totalCount: validUsers.length,
          pagesCount: 1,
          items: sortByField<User>(createdUsers, "createdAt"),
        })
      );
    });

    it("Get users. Query cases. Should return 200 and filtered users", async () => {
      const filteredUsers = createdUsers.filter(
        (user) => user.login.match(/nick/i) || user.email.match(/.COM/i)
      );
      const sortedUsers = sortByField<User>(filteredUsers, "email", "asc");

      await request(app)
        .get(
          `${users_router}?searchLoginTerm=nick&searchEmailTerm=.COM&sortBy=email&sortDirection=asc`
        )
        .expect(
          HTTP_STATUSES.OK_200,
          getPaginationItems({
            pagesCount: 1,
            totalCount: sortedUsers.length,
            items: sortedUsers,
          })
        );

      await request(app)
        .get(`${users_router}?pageNumber=2&pageSize=3`)
        .expect(
          HTTP_STATUSES.OK_200,
          getPaginationItems({
            pagesCount: 2,
            page: 2,
            pageSize: 3,
            totalCount: createdUsers.length,
            items: sortByField<User>(createdUsers, "createdAt").slice(-2),
          })
        );

      await request(app)
        .get(`${users_router}?pageNumber=99`)
        .expect(
          HTTP_STATUSES.OK_200,
          getPaginationItems({
            pagesCount: 1,
            page: 99,
            totalCount: createdUsers.length,
          })
        );
    });

    it("Delete user. Should delete user and return 204", async () => {
      await request(app)
        .delete(`${users_router}/${createdUsers[2].id}`)
        .set(basicAuth)
        .expect(HTTP_STATUSES.NO_CONTENT_204);

      await request(app)
        .get(`${users_router}/${createdUsers[2].id}`)
        .expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it("Delete user. Should return 404", async () => {
      await request(app)
        .delete(`${users_router}/fakeUserId`)
        .set(basicAuth)
        .expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    afterAll(async () => {
      await request(app).delete(delete_all_router);
    });
  });
