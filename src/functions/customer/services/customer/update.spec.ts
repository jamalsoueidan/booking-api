import { UserModel } from "~/functions/user";
import { createUser, getUserObject } from "~/library/jest/helpers";
import { CustomerServiceUpdate } from "./update";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerService", () => {
  const userData = getUserObject();

  beforeAll(async () => UserModel.ensureIndexes());

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
