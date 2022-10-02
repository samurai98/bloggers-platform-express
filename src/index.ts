import express from "express";
import bodyParser from "body-parser";
import { productsRouter } from "./routes/products-router";
import { addressesRouter } from "./routes/addresses-router";
import { videosRouter } from "./routes/videos-router";

const app = express();
const port = process.env.PORT || 3000;

const parserMiddleware = bodyParser({});
app.use(parserMiddleware);

const router = {
  products: "/products",
  addresses: "/addresses",
  hometask: "/hometask_01/api/videos"
} as const;

app.use(router.products, productsRouter);
app.use(router.addresses, addressesRouter);
app.use(router.hometask, videosRouter);

// start app
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
