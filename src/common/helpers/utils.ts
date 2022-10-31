import bcrypt from "bcrypt";

export const getCurrentDateISO = () => new Date().toISOString();

export const generateHash = (password: string, salt: string) =>
  bcrypt.hash(password, salt);
