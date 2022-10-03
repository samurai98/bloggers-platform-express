const products = [
  { id: 1, title: "tomato" },
  { id: 2, title: "orange" },
];

export const productsRepository = {
  findProducts(title?: string) {
    if (!title) return products;

    return products.filter((p) => p.title.indexOf(title) > -1);
  },

  findProductById(id: number) {
    return products.find((p) => p.id === id);
  },

  createProduct(title: string) {
    const newProduct = { id: Number(new Date()), title };
    products.push(newProduct);
    return newProduct;
  },

  updateProduct(id: number, title: string) {
    const product = this.findProductById(id);

    if (!product) return false;

    product.title = title;
    return true;
  },

  deleteProduct(id: number) {
    const index = products.findIndex((product) => product.id === id);

    if (index === -1) return false;

    products.splice(index, 1);
    return true;
  },
};
