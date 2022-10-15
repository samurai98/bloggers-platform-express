import { Router, Request, Response } from "express";
import { body } from "express-validator";

import { HTTP_STATUSES } from "../../../common/http-statuses";
import { inputValidationMiddleware } from "../../../middlewares/input-validation";
import { productsService } from "../services/products-service";

export const productsRouter = Router({});

const titleValidation = body("title")
  .trim()
  .isLength({ min: 3, max: 10 })
  .withMessage("Title length error");

productsRouter.get("/", async (req: Request, res: Response) => {
  const foundProducts = await productsService.findProducts(
    req.query.title?.toString()
  );

  res.send(foundProducts);
});

productsRouter.get("/:id", async (req: Request, res: Response) => {
  const product = await productsService.findProductById(Number(req.params.id));

  if (product) res.send(product);
  else res.send(HTTP_STATUSES.NOT_FOUND_404);
});

productsRouter.post(
  "/",
  titleValidation,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const newProduct = await productsService.createProduct(req.body.title);
    res.status(HTTP_STATUSES.CREATED_201).send(newProduct);
  }
);

productsRouter.put(
  "/:id",
  titleValidation,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const isUpdated = await productsService.updateProduct(id, req.body.title);

    if (isUpdated) {
      const product = await productsService.findProductById(id);
      res.send(product);
    } else res.send(HTTP_STATUSES.NOT_FOUND_404);
  }
);

productsRouter.delete("/:id", async (req: Request, res: Response) => {
  const isDeleted = await productsService.deleteProduct(Number(req.params.id));

  if (isDeleted) res.send(HTTP_STATUSES.NO_CONTENT_204);
  else res.send(HTTP_STATUSES.NOT_FOUND_404);
});
