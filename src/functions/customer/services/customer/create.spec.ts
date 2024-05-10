import { UserModel } from "~/functions/user";
import { getUserObject } from "~/library/jest/helpers";
import { CustomerServiceCreate } from "./create";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerServiceCreate", () => {
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
});
