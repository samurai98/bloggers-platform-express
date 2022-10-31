import bcrypt from "bcrypt";

import { ErrorsMessages } from "common/types";

export const getCurrentDateISO = () => new Date().toISOString();

export const generateHash = (password: string, salt: string) =>
  bcrypt.hash(password, salt);

export const getErrorsMessages = <T extends Record<string, string>>(
  errors: Record<keyof T, string>
): ErrorsMessages => ({
  errorsMessages: Object.entries(errors).map(([key, value]) => ({
    field: key,
    message: value,
  })),
});
