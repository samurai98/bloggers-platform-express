type ProductType = { id: number; title: string };

const products: ProductType[] = [
  { id: 1, title: "tomato" },
  { id: 2, title: "orange" },
];

export const productsRepository = {
  async findProducts(title?: string): Promise<ProductType[]> {
    if (!title) return products;

    return products.filter((p) => p.title.indexOf(title) > -1);
  },

  async findProductById(id: number): Promise<ProductType | undefined> {
    return products.find((p) => p.id === id);
  },

  async createProduct(title: string): Promise<ProductType> {
    const newProduct = { id: Number(new Date()), title };
    products.push(newProduct);
    return newProduct;
  },

  async updateProduct(id: number, title: string): Promise<boolean> {
    const product = await this.findProductById(id);

    if (!product) return false;

    product.title = title;
    return true;
  },

  async deleteProduct(id: number): Promise<boolean> {
    const index = products.findIndex((product) => product.id === id);

    if (index === -1) return false;

    products.splice(index, 1);
    return true;
  },
};
