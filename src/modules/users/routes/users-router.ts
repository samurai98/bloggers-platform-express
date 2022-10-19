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
import { userValidation, usersQueryValidation, checkAuth } from "./validation";

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

    res.status(HTTP_STATUSES.CREATED_201).send(newUser);
  }
);

usersRouter.delete(
  "/:id",
  checkAuth,
  async (req: Request<ParamUser>, res: Response<ResType>) => {
    const isDeleted = await usersService.deleteUser(req.params.id);

    if (isDeleted) res.send(HTTP_STATUSES.NO_CONTENT_204);
    else res.send(HTTP_STATUSES.NOT_FOUND_404);
  }
);