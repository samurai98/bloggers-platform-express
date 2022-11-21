import { CookieOptions } from "express";

import { ResType } from "common/types";

export type ReqBodyAuth = { loginOrEmail: string; password: string };

export type LoginUserData = ReqBodyAuth & { ip: string; ua?: string };

export type ReqBodyConfirm = { code: string };

export type ReqBodyResending = { email: string };

export type ReqBodyNewPassword = { newPassword: string; recoveryCode: string };

export type ResLogin = ResType<{ accessToken: string }>;

export type ResMe = { userId: string; login: string; email: string };

export type RefreshSession = {
  refreshToken: string;
  issuedAt: number;
  expiresIn: number;
  userId: string;
  ip: string;
  deviceId: string;
  deviceName: string;
};

export type ResLoginWithCookie = {
  accessToken: string;
  cookie: { name: string; value: string; options: CookieOptions };
};

export type Device = {
  deviceId: string;
  ip: string;
  title: string;
  lastActiveDate: string;
};

export type ParamDevice = { deviceId: Device["deviceId"] };

export type ResDevices = ResType<Device[]>;
