import { ResType } from "common/types";

export type ReqBodyConfirm = { code: string };

export type ReqBodyResending = { email: string };

export type ResLogin = ResType<{ accessToken: string }>;

export type ResMe = { userId: string; login: string; email: string };
