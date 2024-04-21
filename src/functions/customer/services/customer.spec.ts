import { UserModel } from "~/functions/user";
import { createUser, getUserObject } from "~/library/jest/helpers";
import {
  CustomerServiceCreate,
  CustomerServiceGet,
  CustomerServiceUpdate,
} from "./customer";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerService", () => {
  const userData = getUserObject();

  beforeAll(async () => UserModel.ensureIndexes());

  it("Should create a user", async () => {
    const newUser = await CustomerServiceCreate(userData);

    expect(newUser).toMatchObject(userData);
  });

  it("Should throw error user with the same username", async () => {
    await CustomerServiceCreate({
      ...getUserObject(),
      username: "123123",
    });

    await expect(
      CustomerServiceCreate({
        ...getUserObject(),
        username: "123123",
      })
    ).rejects.toThrow(/E11000 duplicate key error/);
  });

  it("Should get the customer by customerId", async () => {
    const user = await createUser({ customerId: 123 });
    const getUser = await CustomerServiceGet({
      customerId: user.customerId,
    });
    expect(user.customerId).toBe(getUser.customerId);
  });

  it("Should update a user by customerId", async () => {
    const user = await createUser({ customerId: 123 });

    const updatedData = {
      aboutMe: "test test",
    };

    const updatedUser = await CustomerServiceUpdate(
      { customerId: user.customerId },
      updatedData
    );

    expect(updatedUser.aboutMe).toEqual(updatedData.aboutMe);
  });
});
