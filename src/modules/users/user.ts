import { Pagination, Query, ResType } from "common/types";

export type User = {
  id: string;
  email: string;
  login: string;
  createdAt: string;
};

export type ReqBodyUser = {
  email: string;
  login: string;
  password: string;
};

export type ReqBodyAuth = {
  login: string;
  password: string;
};

export type UserDB = User & {
  passHash: string;
  passSalt: string;
};

export type ParamUser = { id: User["id"] };

export type ReqQueryUser = Query & {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
};

export type ResUsers = ResType<Pagination<User>>;

export type ResUser = ResType<User>;
