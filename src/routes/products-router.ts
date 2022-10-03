import { Router, Request, Response } from "express";
import { body } from "express-validator";

import { inputValidationMiddleware } from "../middlewares/input-validation";
import { productsRepository } from "../repositories/products-repository";

export const productsRouter = Router({});

const titleValidation = body("title")
  .trim()
  .isLength({ min: 3, max: 10 })
  .withMessage("Title length error");

productsRouter.get("/", (req: Request, res: Response) => {
  const foundProducts = productsRepository.findProducts(
    req.query.title?.toString()
  );

  res.send(foundProducts);
});

productsRouter.get("/:id", (req: Request, res: Response) => {
  const product = productsRepository.findProductById(Number(req.params.id));

  if (product) res.send(product);
  else res.send(404);
});

productsRouter.post(
  "/",
  titleValidation,
  inputValidationMiddleware,
  (req: Request, res: Response) => {
    const newProduct = productsRepository.createProduct(req.body.title);
    res.status(201).send(newProduct);
  }
);

productsRouter.put(
  "/:id",
  titleValidation,
  inputValidationMiddleware,
  (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const isUpdated = productsRepository.updateProduct(id, req.body.title);

    if (isUpdated) {
      const product = productsRepository.findProductById(id);
      res.send(product);
    } else res.send(404);
  }
);

productsRouter.delete("/:id", (req: Request, res: Response) => {
  const isDeleted = productsRepository.deleteProduct(Number(req.params.id));

  if (isDeleted) res.send(204);
  else res.send(404);
});
