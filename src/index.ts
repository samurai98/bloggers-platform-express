import express from "express";
import dotenv from "dotenv";

import { runDB } from "./common/db";
import { useRouters } from "./routers";

dotenv.config();

export const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

useRouters(app);

const startApp = async () => {
  await runDB();
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

startApp();
