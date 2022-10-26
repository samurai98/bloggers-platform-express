import { productsCollection } from "common/db";

import { Product } from "../product";

export const productsRepository = {
  async findProducts(title?: string): Promise<Product[]> {
    const filter: any = {};

    if (title) {
      filter.title = { $reqex: title };
    }

    return await productsCollection.find(filter).toArray();
  },

  async findProductById(id: number): Promise<Product | null> {
    return await productsCollection.findOne({ id });
  },

  async createProduct(product: Product): Promise<Product> {
    await productsCollection.insertOne(product);

    return product;
  },

  async updateProduct(id: number, title: string): Promise<boolean> {
    const result = await productsCollection.updateOne(
      { id },
      { $set: { title } }
    );

    return result.matchedCount === 1;
  },

  async deleteProduct(id: number): Promise<boolean> {
    const result = await productsCollection.deleteOne({ id });

    return result.deletedCount === 1;
  },
};
