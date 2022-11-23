import env from "dotenv";

const IS_LOCAL_VERSION = !process.env.PORT;
IS_LOCAL_VERSION && env.config(); //set env in developer mode

export const SETTINGS = {
  PORT: process.env.PORT || 3000,
  IS_LOCAL_VERSION,
  MONGO_DB_URI: process.env.MONGO_DB_URI || "mongodb://0.0.0.0:27017",
  JWT_SECRET: process.env.JWT_SECRET || "secret",
  ROUNDS_SALT_COUNT: process.env.ROUNDS_SALT_COUNT,
  ACCESS_TOKEN_LIFE_TIME_SECONDS: process.env.ACCESS_TOKEN_LIFE_TIME_SECONDS || 300,
  REFRESH_TOKEN_LIFE_TIME_HOURS: process.env.REFRESH_TOKEN_LIFE_TIME_HOURS || 1,
  GMAIL_EMAIL: process.env.GMAIL_EMAIL,
  GMAIL_PASS: process.env.GMAIL_PASS,
  CLIENT_URL: process.env.CLIENT_URL,
  IS_RUN_TEST: process.env.NODE_ENV === "test",
};
