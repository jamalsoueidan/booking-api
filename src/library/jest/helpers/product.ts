import { faker } from "@faker-js/faker";
import { ProductModel } from "~/functions/product";
import { Product } from "~/functions/product/product.types";

export const createProduct = ({
  productId,
  duration = 45,
  buffertime = 15,
  active = true,
}: Pick<Product, "productId"> & Partial<Product>) => {
  return ProductModel.create({
    buffertime,
    collectionId: parseInt(faker.random.numeric(10), 10),
    duration,
    productId,
    title: faker.company.name(),
    active,
  });
};
