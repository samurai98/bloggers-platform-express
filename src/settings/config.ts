import env from "dotenv";

const IS_LOCAL_VERSION = !process.env.PORT;
IS_LOCAL_VERSION && env.config(); //set env in developer mode

export const SETTINGS = {
  PORT: process.env.PORT || 3000,
  IS_LOCAL_VERSION,
  MONGO_DB_URI: process.env.MONGO_DB_URI || "mongodb://0.0.0.0:27017",
  JWT_SECRET: process.env.JWT_SECRET || "secret",
  GMAIL_LOGIN: process.env.GMAIL_LOGIN,
  GMAIL_PASS: process.env.GMAIL_PASS,
};
