import { IProductDocument } from "~/functions/product";
import { Tag } from "~/functions/shift";
import { IUserDocument } from "~/functions/user";
import { createProduct, createUser } from "~/library/jest/helpers";
import {
  ProductUsersServiceAdd,
  ProductUsersServiceGetAll,
} from "./product-users.service";

require("~/library/jest/mongoose/mongodb.jest");

const pid = 123456789;

describe("ProductUsersService", () => {
  let product: IProductDocument;
  let user: IUserDocument;

  beforeEach(async () => {
    product = await createProduct({ pid });
    user = await createUser();
  });

  it("Should be able to add user to product", async () => {
    const query = {
      productId: product._id,
      userId: user._id,
      tag: Tag.all_day,
    };

    const findProduct = await ProductUsersServiceAdd(query);
    expect(findProduct?.pid).toEqual(pid);
  });

  it("Should be able to find all products user belongs to", async () => {
    const query = {
      productId: product._id,
      userId: user._id,
      tag: Tag.all_day,
    };

    await ProductUsersServiceAdd(query);

    const products = await ProductUsersServiceGetAll({ userId: user._id });
    console.log(products);
    expect(products.length).toEqual(1);
  });
});
