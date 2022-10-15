import { Router, Request, Response } from "express";

import { HTTP_STATUSES } from "../../../common/http-statuses";

export const addressesRouter = Router({});

const addresses = [
  { id: 1, value: "Nesal 12" },
  { id: 2, value: "Sel 11" },
];

addressesRouter.get("/", (req: Request, res: Response) => {
  res.send(addresses);
});

addressesRouter.get("/:id", (req: Request, res: Response) => {
  const address = addresses.find((p) => p.id === Number(req.params.id));
  if (address) {
    res.send(address);
  } else res.send(HTTP_STATUSES.NOT_FOUND_404);
});
