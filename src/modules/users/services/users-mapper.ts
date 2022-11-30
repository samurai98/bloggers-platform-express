import { UserDB, User } from '../user';

export const userMapper = (userDB: UserDB): User => {
  const { id, email, login, createdAt } = userDB.accountData;

  return { id, email, login, createdAt };
};
