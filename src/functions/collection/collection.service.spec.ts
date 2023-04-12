import { HttpRequest, InvocationContext } from "@azure/functions";
import { createContext } from "~/library/jest/azure";
import {
  createCollection,
  createProduct,
  createUserWithShift,
} from "~/library/jest/helpers";
import { ProductServiceUpdate } from "../product";
import { Tag } from "../shift";
import {
  CollectionServiceAddProduct,
  CollectionServiceGetAll,
} from "./collection.service";

require("~/library/jest/mongoose/mongodb.jest");

describe("CollectionService", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(async () => {
    context = createContext();
  });

  it("Should be able to get all collections with all product and users relations", async () => {
    const collection = await createCollection();
    const product = await createProduct({ productId: 321 });
    await CollectionServiceAddProduct(
      collection.collectionId,
      product.productId
    );

    const { user } = await createUserWithShift({ tag: Tag.all_day });
    await ProductServiceUpdate(product._id, {
      users: [{ userId: user._id, tag: Tag.end_of_week }],
    });

    const product2 = await createProduct({ productId: 123 });
    await CollectionServiceAddProduct(
      collection.collectionId,
      product2.productId
    );

    const collections = await CollectionServiceGetAll();
    expect(collections[0].products.length).toBe(2);

    const productUsers = collections[0].products.find(
      (p) => p.productId === 321
    );

    expect(productUsers?.users.length).toBe(1);
  });
});
