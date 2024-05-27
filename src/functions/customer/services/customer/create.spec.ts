import { UserModel } from "~/functions/user";
import { getUserObject } from "~/library/jest/helpers";
import { CustomerServiceCreate } from "./create";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerServiceCreate", () => {
  beforeAll(async () => {
    await UserModel.ensureIndexes();
  });

  it("Should create a user", async () => {
    const userData = getUserObject();
    const user = await CustomerServiceCreate(userData);
    expect(user).toMatchObject(userData);
  });
});
