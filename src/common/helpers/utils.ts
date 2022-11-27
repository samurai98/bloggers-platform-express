import bcrypt from 'bcrypt';

import { ErrorsMessages } from '../types/common';

export const getCurrentDateISO = () => new Date().toISOString();

export const stringDateToMs = (date: string) => Date.parse(date);

export const generateHash = (password: string, salt: string) => bcrypt.hash(password, salt);

export const getErrorsMessages = <T extends Record<string, string>>(
  errors: Record<keyof T, string>
): ErrorsMessages => ({
  errorsMessages: Object.entries(errors).map(([key, value]) => ({ field: key, message: value })),
});
