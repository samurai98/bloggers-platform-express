import { Router, Request, Response } from "express";

import { HTTP_STATUSES } from "common/http-statuses";
import { ResType } from "common/types";

import { usersService } from "../services/users-service";
import { ReqBodyAuth } from "../user";
import { authValidation } from "./validation";

export const authRouter = Router({});

authRouter.post(
  "/login",
  authValidation,
  async (req: Request<{}, {}, ReqBodyAuth>, res: Response<ResType>) => {
    const result = await usersService.authUser(req.body);

    if (result) res.send(HTTP_STATUSES.NO_CONTENT_204);
    else res.send(HTTP_STATUSES.UNAUTHORIZED_401);
  }
);
