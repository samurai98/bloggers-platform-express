import { Router, Request, Response } from "express";
import { body } from "express-validator";

import { inputValidationMiddleware } from "../middlewares/input-validation";
import { productsRepository } from "../repositories/products-db-repository";

export const productsRouter = Router({});

const titleValidation = body("title")
  .trim()
  .isLength({ min: 3, max: 10 })
  .withMessage("Title length error");

productsRouter.get("/", async (req: Request, res: Response) => {
  const foundProducts = await productsRepository.findProducts(
    req.query.title?.toString()
  );

  res.send(foundProducts);
});

productsRouter.get("/:id", async (req: Request, res: Response) => {
  const product = await productsRepository.findProductById(Number(req.params.id));

  if (product) res.send(product);
  else res.send(404);
});

productsRouter.post(
  "/",
  titleValidation,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const newProduct = await productsRepository.createProduct(req.body.title);
    res.status(201).send(newProduct);
  }
);

productsRouter.put(
  "/:id",
  titleValidation,
  inputValidationMiddleware,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const isUpdated = await productsRepository.updateProduct(id, req.body.title);

    if (isUpdated) {
      const product = await productsRepository.findProductById(id);
      res.send(product);
    } else res.send(404);
  }
);

productsRouter.delete("/:id", async (req: Request, res: Response) => {
  const isDeleted = await productsRepository.deleteProduct(Number(req.params.id));

  if (isDeleted) res.send(204);
  else res.send(404);
});
