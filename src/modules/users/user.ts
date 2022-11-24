import { Pagination, Query, ResType } from "common/types/common";

export type User = {
  id: string;
  email: string;
  login: string;
  createdAt: string;
};

export type ReqBodyUser = { email: string; login: string; password: string };

export type UserDB = {
  accountData: UserAccountData;
  emailConfirmation: UserEmailConfirmation;
  passwordRecovery?: PasswordRecovery;
};

type UserAccountData = User & { passHash: string; passSalt: string };

export type UserEmailConfirmation = {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
};

export type PasswordRecovery = {
  recoveryCode: string;
  expirationDate: Date;
};

export type ParamUser = { id: User["id"] };

export type ReqQueryUser = Query & {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
};

export type ResUsers = ResType<Pagination<User>>;

export type ResUser = ResType<User>;
