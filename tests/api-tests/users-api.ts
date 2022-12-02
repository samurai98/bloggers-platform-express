import request from 'supertest';

import { app } from '../../src/index';
import { HTTP_STATUSES } from '../../src/common/http-statuses';
import { router } from '../../src/routers';
import { User } from '../../src/modules/users/user';
import { SessionModel } from '../../src/common/db';

import { incorrectQuery, bearerAuth } from '../common/data';
import { getPaginationItems, sortByField } from '../common/helpers';
import { createUser } from '../common/tests-helpers';

const createdUsers: User[] = [];

export const testUsersApi = () =>
  describe('Test users api', () => {
    it('Users without auth. Should return 401', async () => {
      await request(app).delete(`${router.users}/fakeUserId`).expect(HTTP_STATUSES.UNAUTHORIZED_401);
    });

    it('Get users. Should return 200 and empty array', async () => {
      await request(app).get(router.users).expect(HTTP_STATUSES.OK_200, getPaginationItems());
    });

    it('Get users. Incorrect query cases. Should return 200 and empty array', async () => {
      await request(app)
        .get(`${router.users}?${incorrectQuery.empty}&searchLoginTerm=&searchEmailTerm=`)
        .expect(HTTP_STATUSES.OK_200, getPaginationItems());

      await request(app)
        .get(`${router.users}?${incorrectQuery.incorrect}&searchLoginTerm[]=&searchEmailTerm[]=`)
        .expect(HTTP_STATUSES.OK_200, getPaginationItems());
    });

    it('Get users. Query cases. Should return 200 and filtered users', async () => {
      for (let index = 0; index < 5; index++) {
        const newUser = await createUser({ isLogin: index === 0, validUserIndex: index });
        createdUsers.push(newUser);
      }

      const filteredUsers = createdUsers.filter(user => user.login.match(/nick/i) || user.email.match(/.COM/i));
      const sortedUsers = sortByField<User>(filteredUsers, 'email', 'asc');

      await request(app)
        .get(`${router.users}?searchLoginTerm=nick&searchEmailTerm=.COM&sortBy=email&sortDirection=asc`)
        .expect(
          HTTP_STATUSES.OK_200,
          getPaginationItems({ pagesCount: 1, totalCount: sortedUsers.length, items: sortedUsers })
        );

      await request(app)
        .get(`${router.users}?pageNumber=2&pageSize=3`)
        .expect(
          HTTP_STATUSES.OK_200,
          getPaginationItems({
            pagesCount: 2,
            page: 2,
            pageSize: 3,
            totalCount: createdUsers.length,
            items: sortByField<User>(createdUsers, 'createdAt').slice(-2),
          })
        );

      await request(app)
        .get(`${router.users}?pageNumber=99`)
        .expect(HTTP_STATUSES.OK_200, getPaginationItems({ pagesCount: 1, page: 99, totalCount: createdUsers.length }));
    });

    it('Delete user another user. Should return 403', async () => {
      await request(app)
        .delete(`${router.users}/${createdUsers[3].id}`)
        .set(bearerAuth)
        .expect(HTTP_STATUSES.FORBIDDEN_403);
      await request(app).get(`${router.users}/${createdUsers[3].id}`).expect(HTTP_STATUSES.OK_200, createdUsers[3]);
    });

    it('Delete user. Should return 404', async () => {
      await request(app).delete(`${router.users}/fakeUserId`).set(bearerAuth).expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    it('Delete user. Should delete user (& sessions) and return 204', async () => {
      await request(app)
        .delete(`${router.users}/${createdUsers[0].id}`)
        .set(bearerAuth)
        .expect(HTTP_STATUSES.NO_CONTENT_204);

      const sessions = await SessionModel.find({ userId: createdUsers[3].id });
      expect(sessions.length).toEqual(0);

      await request(app).get(`${router.users}/${createdUsers[0].id}`).expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    afterAll(async () => {
      await request(app).delete(router.delete_all);
    });
  });
