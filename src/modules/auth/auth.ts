import { CookieOptions } from "express";

import { ResType } from "common/types";

export type ReqBodyAuth = { login: string; password: string };

export type LoginUserData = ReqBodyAuth & { ip: string };

export type ReqBodyConfirm = { code: string };

export type ReqBodyResending = { email: string };

export type ResLogin = ResType<{ accessToken: string }>;

export type ResMe = { userId: string; login: string; email: string };

export type RefreshSession = {
  refreshToken: string;
  userId: string;
  ip: string;
  expiresIn: number;
};

export type ResLoginWithCookie = {
  accessToken: string;
  cookie: { name: string; value: string; options: CookieOptions };
};
