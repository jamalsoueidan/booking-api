import { faker } from "@faker-js/faker";
import { ProductServiceUpdate } from "~/functions/product";
import { Tag } from "~/functions/shift";
import { UserServiceFindByIdAndUpdate } from "~/functions/user";
import {
  createProduct,
  createUserWithShift,
  createUserWithShiftAndUpdateProduct,
} from "~/library/jest/helpers";
import { AvailabilityServiceGetUsers } from "./get-users";

require("~/library/jest/mongoose/mongodb.jest");

const productId = parseInt(faker.random.numeric(10), 10);
const tag = Tag.end_of_week;

describe("AvailabilityServiceGetUsers", () => {
  it("Should return 1 user after adding 1 user to product", async () => {
    const product = await createProduct({ productId });

    await createUserWithShiftAndUpdateProduct({
      product,
      tag,
    });

    const allUsers = await AvailabilityServiceGetUsers({
      productId,
    });

    expect(allUsers).toHaveLength(1);
  });

  it("should return 2 users after adding 2 users to product", async () => {
    const { user: user1 } = await createUserWithShift({ tag });
    const { user: user2 } = await createUserWithShift({ tag });

    const product = await createProduct({ productId });
    await ProductServiceUpdate(product._id, {
      users: [
        { userId: user1._id, tag },
        { userId: user2._id, tag },
      ],
    });

    const allUsers = await AvailabilityServiceGetUsers({
      productId,
    });

    expect(allUsers).toHaveLength(2);
  });

  it("Should not include inactive user.", async () => {
    const product = await createProduct({ productId });
    const { user } = await createUserWithShiftAndUpdateProduct({
      product,
      tag,
    });

    await UserServiceFindByIdAndUpdate(user._id, {
      active: false,
    });

    const query = {
      productId,
    };

    const allUsers = await AvailabilityServiceGetUsers(query);
    expect(allUsers).toHaveLength(0);
  });
});
