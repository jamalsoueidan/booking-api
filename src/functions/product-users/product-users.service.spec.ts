import { Tag } from "~/functions/shift";
import { IUserDocument } from "~/functions/user";
import { createProduct, createUser } from "~/library/jest/helpers";
import {
  ProductUsersServiceAdd,
  ProductUsersServiceGetAll,
  ProductUsersServiceRemove,
} from "./product-users.service";

require("~/library/jest/mongoose/mongodb.jest");

const productId = 123456789;

describe("ProductUsersService", () => {
  let user: IUserDocument;

  beforeEach(async () => {
    user = await createUser();
  });

  it("Should be able to add user to product", async () => {
    const product = await createProduct({ productId });
    const findProduct = await ProductUsersServiceAdd({
      productId: product.productId,
      userId: user._id,
      tag: Tag.all_day,
    });
    expect(findProduct?.productId).toEqual(productId);
  });

  it("Should be able to find all products user belongs to", async () => {
    const product = await createProduct({ productId });
    const product2 = await createProduct({ productId: 3432 });

    await ProductUsersServiceAdd({
      productId: product.productId,
      userId: user._id,
      tag: Tag.all_day,
    });

    await ProductUsersServiceAdd({
      productId: product2.productId,
      userId: user._id,
      tag: Tag.middle_of_week,
    });

    const products = await ProductUsersServiceGetAll({ userId: user._id });
    expect(products.length).toEqual(2);
  });

  it("Should be able to remove user from product", async () => {
    const product = await createProduct({ productId });
    const findProduct = await ProductUsersServiceAdd({
      productId: product.productId,
      userId: user._id,
      tag: Tag.all_day,
    });
    expect(findProduct?.productId).toEqual(productId);

    const remove = await ProductUsersServiceRemove({
      productId: product.productId,
      userId: user._id,
    });

    expect(remove.deletedCount).toBe(1);
  });

  it("Should not be able to add user to non-existent product", async () => {
    const nonExistentProductId = 987654321;

    await expect(
      ProductUsersServiceAdd({
        productId: nonExistentProductId,
        userId: user._id,
        tag: Tag.all_day,
      })
    ).rejects.toThrowError(Error);
  });

  it("Should not remove user from a non-existent product", async () => {
    const nonExistentProductId = 987654321;
    const remove = await ProductUsersServiceRemove({
      productId: nonExistentProductId,
      userId: user._id,
    });

    expect(remove.deletedCount).toBe(0);
  });

  it("Should not remove non-existent user from a product", async () => {
    const product = await createProduct({ productId });
    const user = await createUser();
    const remove = await ProductUsersServiceRemove({
      productId: product.productId,
      userId: user._id,
    });

    expect(remove.deletedCount).toBe(0);
  });
});
