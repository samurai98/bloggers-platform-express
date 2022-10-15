import { productsRepository } from "../repositories/products-db-repository";
import { Product } from "../product";

export const productsService = {
  async findProducts(title?: string): Promise<Product[]> {
    return productsRepository.findProducts(title);
  },

  async findProductById(id: number): Promise<Product | null> {
    return productsRepository.findProductById(id);
  },

  async createProduct(title: string): Promise<Product> {
    const newProduct: Product = { id: Number(new Date()), title };

    return productsRepository.createProduct(newProduct);
  },

  async updateProduct(id: number, title: string): Promise<boolean> {
    return productsRepository.updateProduct(id, title);
  },

  async deleteProduct(id: number): Promise<boolean> {
    return productsRepository.deleteProduct(id);
  },
};
