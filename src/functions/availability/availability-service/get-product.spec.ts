import { ProductServiceUpdate } from "~/functions/product";
import { Tag } from "~/functions/shift";
import { IUserDocument } from "~/functions/user";
import { createProduct, createUserWithShift } from "~/library/jest/helpers";
import { AvailabilityServiceGetProduct } from "./get-product";

require("~/library/jest/mongoose/mongodb.jest");

const productId = 777;
let user: IUserDocument;

describe("AvailabilityServiceGetProduct", () => {
  beforeEach(async () => {
    const product = await createProduct({ productId });
    const { user: user1 } = await createUserWithShift({ tag: Tag.all_day });
    user = user1;

    const { user: user2 } = await createUserWithShift({
      tag: Tag.end_of_week,
    });

    await ProductServiceUpdate(product._id.toString(), {
      active: true,
      users: [
        { userId: user1._id, tag: Tag.all_day },
        { userId: user2._id, tag: Tag.end_of_week },
      ],
    });
  });

  it("Should return one user for product", async () => {
    const product = await AvailabilityServiceGetProduct({
      productId,
      userId: user._id.toString(),
    });

    expect(product?.users.length).toBe(1);
  });

  it("Should return all users for product", async () => {
    const productwithUsers = await AvailabilityServiceGetProduct({
      productId,
    });

    expect(productwithUsers?.users.length).toBe(2);
  });
});
