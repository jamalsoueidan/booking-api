import { faker } from "@faker-js/faker";
import { ProductModel } from "~/functions/product";
import { Product } from "~/functions/product/product.types";

export const createProduct = ({
  productId,
  duration = 45,
  buffertime = 15,
}: Pick<Product, "productId"> &
  Partial<Pick<Product, "duration" | "buffertime">>) => {
  return ProductModel.create({
    buffertime,
    collectionId: parseInt(faker.random.numeric(10), 10),
    duration,
    productId,
    title: faker.company.name(),
    users: [],
  });
};
