import express from "express";

import { addRequestContext } from "middlewares";
import { SETTINGS } from "settings/config";

import { runDB } from "./common/db";
import { useRouters } from "./routers";

export const app = express();
const port = SETTINGS.PORT;

app.use(express.json());
app.use(addRequestContext());

useRouters(app);

const startApp = async () => {
  await runDB();

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

startApp();
