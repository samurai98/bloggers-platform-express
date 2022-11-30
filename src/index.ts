import express from 'express';
import cookieParser from 'cookie-parser';

import { addRequestContext } from './middlewares';
import { SETTINGS } from './settings/config';
import { runDB } from './common/db';
import { useRouters } from './routers';
import './uncaughtException';

export const app = express();
const port = SETTINGS.PORT;

app.use(express.json());
app.use(addRequestContext());
app.use(cookieParser(SETTINGS.COOKIE_SECRET));
app.set('trust proxy', 1);

useRouters(app);

const startApp = async () => {
  await runDB();

  app.listen(port, () => {
    console.info(`✅ Example app listening on port ${port}`);
  });
};

startApp();
