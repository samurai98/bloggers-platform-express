import { Router, Request, Response } from "express";

import { HTTP_STATUSES } from "common/http-statuses";
import { ResType } from "common/types";

import { usersQueryRepository } from "../repositories";
import { usersService } from "../services/users-service";
import {
  ParamUser,
  ReqBodyUser,
  ReqQueryUser,
  ResUser,
  ResUsers,
} from "../user";
import {
  userValidation,
  usersQueryValidation,
  checkBasicAuth,
} from "./validation";

export const usersRouter = Router({});

usersRouter.get(
  "/",
  usersQueryValidation,
  async (req: Request<{}, {}, {}, ReqQueryUser>, res: Response<ResUsers>) => {
    res.send(await usersQueryRepository.getUsers(req.query));
  }
);

usersRouter.post(
  "/",
  userValidation,
  async (req: Request<{}, {}, ReqBodyUser>, res: Response<ResUser>) => {
    const newUser = await usersService.createUser(req.body);

    if (newUser) res.status(HTTP_STATUSES.CREATED_201).send(newUser);
    else res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400);
  }
);

usersRouter.delete(
  "/:id",
  checkBasicAuth,
  async (req: Request<ParamUser>, res: Response<ResType>) => {
    const isDeleted = await usersService.deleteUser(req.params.id);

    if (isDeleted) res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    else res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  }
);
