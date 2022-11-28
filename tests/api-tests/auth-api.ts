import request from 'supertest';

import { app } from '../../src/index';
import { HTTP_STATUSES } from '../../src/common/http-statuses';
import { router } from '../../src/routers';
import { ReqBodyUser, User } from '../../src/modules/users/user';
import { jwtService } from '../../src/common/services/jwt-service';
import { authPath } from '../../src/modules/auth/routes/auth-router';
import { usersQueryRepository } from '../../src/modules/users/repositories';
import { ReqBodyAuth, ReqBodyConfirm, ReqBodyNewPassword, ReqBodyResending } from '../../src/modules/auth/auth';

import { bearerAuth, validUsers } from '../common/data';
import { anyString, dateISORegEx, getErrorsMessages, setBearerAuth } from '../common/helpers';

let createdUser = {} as User;

const checkCookie = (cookie: string) => {
  const cookieSplit = cookie.split('; ');

  expect(cookieSplit.includes('Secure')).toEqual(true);
  expect(cookieSplit.includes('HttpOnly')).toEqual(true);
  expect(cookieSplit[0].split('=')[0]).toEqual('refreshToken');
  expect(cookieSplit[0].split('=')[1]).toEqual(anyString);
};

export const testAuthApi = () =>
  describe('Test auth api', () => {
    it('Registration user. Incorrect body cases. Should return 400 and errorsMessages', async () => {
      const firstRes = await request(app).post(`${router.auth}${authPath.registration}`).send();

      expect(firstRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(firstRes.body).toEqual(getErrorsMessages<ReqBodyUser>('login', 'password', 'email'));
      expect(firstRes.body.errorsMessages).toHaveLength(3);

      const secondRes = await request(app)
        .post(`${router.auth}${authPath.registration}`)
        .send({ login: 'valid', password: '' });

      expect(secondRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(secondRes.body).toEqual(getErrorsMessages<ReqBodyUser>('password', 'email'));
      expect(secondRes.body.errorsMessages).toHaveLength(2);
    });

    it('Confirm registration. Incorrect body cases. Should return 400 and errorsMessages', async () => {
      const firstRes = await request(app).post(`${router.auth}${authPath.confirmRegistration}`).send();

      expect(firstRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(firstRes.body).toEqual(getErrorsMessages<ReqBodyConfirm>('code'));
      expect(firstRes.body.errorsMessages).toHaveLength(1);

      const secondRes = await request(app)
        .post(`${router.auth}${authPath.confirmRegistration}`)
        .send({ code: 'not valid code' });

      expect(secondRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(secondRes.body).toEqual(getErrorsMessages<ReqBodyConfirm>('code'));
      expect(secondRes.body.errorsMessages).toHaveLength(1);
    });

    it('Registration user and confirm registration. Should return 204', async () => {
      await request(app)
        .post(`${router.auth}${authPath.registration}`)
        .send(validUsers[0])
        .expect(HTTP_STATUSES.NO_CONTENT_204);

      const userDB = await usersQueryRepository.findUserByLoginOrEmail(validUsers[0].email);

      await request(app)
        .post(`${router.auth}${authPath.confirmRegistration}`)
        .send({ code: userDB!.emailConfirmation.confirmationCode })
        .expect(HTTP_STATUSES.NO_CONTENT_204);

      createdUser = userDB!.accountData as User;
    });

    it('Login user. Should return 401', async () => {
      await request(app)
        .post(`${router.auth}${authPath.login}`)
        .send({ loginOrEmail: 'some user', password: '123456' })
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);

      await request(app)
        .post(`${router.auth}${authPath.login}`)
        .send({ loginOrEmail: validUsers[0].email, password: 'fakePassword' })
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);
    });

    it('Login user. Incorrect body cases. Should return 400 and errorsMessages', async () => {
      const firstRes = await request(app).post(`${router.auth}${authPath.login}`).send();

      expect(firstRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(firstRes.body).toEqual(getErrorsMessages<ReqBodyAuth>('loginOrEmail', 'password'));
      expect(firstRes.body.errorsMessages).toHaveLength(2);

      const secondRes = await request(app)
        .post(`${router.auth}${authPath.login}`)
        .send({ loginOrEmail: 'valid', password: '' });

      expect(secondRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(secondRes.body).toEqual(getErrorsMessages<ReqBodyAuth>('password'));
      expect(secondRes.body.errorsMessages).toHaveLength(1);
    });

    it('Login user. Should return 200, accessToken in body and refreshToken in cookie', async () => {
      const firstRes = await request(app)
        .post(`${router.auth}${authPath.login}`)
        .send({ loginOrEmail: validUsers[0].login, password: validUsers[0].password });

      const firstUserIdByToken = await jwtService.getUserIdByToken(firstRes.body.accessToken);

      checkCookie(firstRes.header['set-cookie'][0]);
      expect(firstRes.statusCode).toEqual(HTTP_STATUSES.OK_200);
      expect(firstUserIdByToken).toEqual(createdUser.id);

      const secondRes = await request(app)
        .post(`${router.auth}${authPath.login}`)
        .send({ loginOrEmail: validUsers[0].email, password: validUsers[0].password });

      const secondCookie = secondRes.header['set-cookie'][0];
      const secondUserIdByToken = await jwtService.getUserIdByToken(secondRes.body.accessToken);

      checkCookie(secondCookie);
      expect(secondRes.statusCode).toEqual(HTTP_STATUSES.OK_200);
      expect(secondUserIdByToken).toEqual(createdUser.id);

      setBearerAuth(secondRes.body.accessToken, secondCookie);
    });

    it('Refresh token. Should return 200, accessToken in body and refreshToken in cookie', async () => {
      const res = await request(app).post(`${router.auth}${authPath.refreshToken}`).set(bearerAuth);

      const userIdByToken = await jwtService.getUserIdByToken(res.body.accessToken);

      const cookie = res.header['set-cookie'][0];

      checkCookie(cookie);
      expect(res.statusCode).toEqual(HTTP_STATUSES.OK_200);
      expect(userIdByToken).toEqual(createdUser.id);
      expect(bearerAuth.Cookie).not.toEqual(cookie);

      setBearerAuth(res.body.accessToken, cookie);
    });

    it('Refresh token. Should return 401', async () => {
      await request(app).post(`${router.auth}${authPath.refreshToken}`).expect(HTTP_STATUSES.UNAUTHORIZED_401);
    });

    it('Get user information (me). Should return 200 and user information', async () => {
      const { id: userId, email, login } = createdUser;

      await request(app)
        .get(`${router.auth}${authPath.me}`)
        .set(bearerAuth)
        .expect(HTTP_STATUSES.OK_200, { userId, email, login });
    });

    it('Get user information (me). Should return 401', async () => {
      await request(app)
        .get(`${router.auth}${authPath.me}`)
        .set({ Authorization: 'Bearer fakeToken' })
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);

      await request(app)
        .get(`${router.auth}${authPath.me}`)
        .set({ Authorization: 'fakeBearerToken' })
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);
    });

    it('Resending email. Incorrect body cases. Should return 400 and errorsMessages', async () => {
      const firstRes = await request(app)
        .post(`${router.auth}${authPath.resendingEmail}`)
        .send({ email: createdUser.email })
        .expect(HTTP_STATUSES.BAD_REQUEST_400);

      expect(firstRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(firstRes.body).toEqual(getErrorsMessages<ReqBodyResending>('email'));
      expect(firstRes.body.errorsMessages).toHaveLength(1);

      const secondRes = await request(app)
        .post(`${router.auth}${authPath.resendingEmail}`)
        .send()
        .expect(HTTP_STATUSES.BAD_REQUEST_400);

      expect(secondRes.statusCode).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(secondRes.body).toEqual(getErrorsMessages<ReqBodyResending>('email'));
      expect(secondRes.body.errorsMessages).toHaveLength(1);
    });

    it('Resending email. Should return 204', async () => {
      await request(app)
        .post(`${router.auth}${authPath.registration}`)
        .send(validUsers[1])
        .expect(HTTP_STATUSES.NO_CONTENT_204);

      await request(app)
        .post(`${router.auth}${authPath.resendingEmail}`)
        .send({ email: validUsers[1].email })
        .expect(HTTP_STATUSES.NO_CONTENT_204);
    });

    it('Logout. Should return 401', async () => {
      await request(app).post(`${router.auth}${authPath.logout}`).expect(HTTP_STATUSES.UNAUTHORIZED_401);
    });

    it('Logout. Should return 204 and revoke refreshToken', async () => {
      await request(app).post(`${router.auth}${authPath.logout}`).set(bearerAuth).expect(HTTP_STATUSES.NO_CONTENT_204);

      await request(app)
        .post(`${router.auth}${authPath.refreshToken}`)
        .set(bearerAuth)
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);
    });

    it('Password recovery. Should return 400', async () => {
      const firstRes = await request(app).post(`${router.auth}${authPath.passwordRecovery}`).send();

      expect(firstRes.status).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(firstRes.body).toEqual(getErrorsMessages<ReqBodyResending>('email'));

      const secondRes = await request(app)
        .post(`${router.auth}${authPath.passwordRecovery}`)
        .send({ email: 'fake.mail.ru' });

      expect(secondRes.status).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(secondRes.body).toEqual(getErrorsMessages<ReqBodyResending>('email'));
    });

    let passwordRecoveryCode = '';

    it('Password recovery. Should return 204, even if current email is not registered', async () => {
      await request(app)
        .post(`${router.auth}${authPath.passwordRecovery}`)
        .send({ email: createdUser.email })
        .expect(HTTP_STATUSES.NO_CONTENT_204);

      await request(app)
        .post(`${router.auth}${authPath.passwordRecovery}`)
        .send({ email: 'fakeusermail@gm.ru' })
        .expect(HTTP_STATUSES.NO_CONTENT_204);

      const user = await usersQueryRepository.findUserByLoginOrEmail(createdUser.email);

      passwordRecoveryCode = user?.passwordRecovery?.recoveryCode as string;

      expect(user?.passwordRecovery?.expirationDate.toISOString()).toEqual(dateISORegEx);
      expect(passwordRecoveryCode).toEqual(anyString);
    });

    it('Set new password. Should return 400', async () => {
      const firstRes = await request(app).post(`${router.auth}${authPath.newPassword}`).send();

      expect(firstRes.status).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(firstRes.body).toEqual(getErrorsMessages<ReqBodyNewPassword>('newPassword', 'recoveryCode'));

      const secondRes = await request(app)
        .post(`${router.auth}${authPath.newPassword}`)
        .send({ newPassword: 'validPassword', recoveryCode: 'fakecode' });

      expect(secondRes.status).toEqual(HTTP_STATUSES.BAD_REQUEST_400);
      expect(secondRes.body).toEqual(getErrorsMessages<ReqBodyNewPassword>('recoveryCode'));
    });

    it('Set new password. Should return 204 and update password', async () => {
      const newPassword = 'validPassword';

      await request(app)
        .post(`${router.auth}${authPath.newPassword}`)
        .send({ newPassword, recoveryCode: passwordRecoveryCode })
        .expect(HTTP_STATUSES.NO_CONTENT_204);

      const user = await usersQueryRepository.findUserByLoginOrEmail(createdUser.email);

      expect(user?.passwordRecovery).toEqual(undefined);

      await request(app)
        .post(`${router.auth}${authPath.login}`)
        .send({ loginOrEmail: createdUser.email, password: validUsers[0].password })
        .expect(HTTP_STATUSES.UNAUTHORIZED_401);

      const loginRes = await request(app)
        .post(`${router.auth}${authPath.login}`)
        .send({ loginOrEmail: createdUser.email, password: newPassword });

      const expectedToken = await jwtService.getUserIdByToken(loginRes.body.accessToken);

      expect(loginRes.statusCode).toEqual(HTTP_STATUSES.OK_200);
      expect(expectedToken).toEqual(createdUser.id);
    });

    afterAll(async () => {
      await request(app).delete(router.delete_all);
    });
  });
