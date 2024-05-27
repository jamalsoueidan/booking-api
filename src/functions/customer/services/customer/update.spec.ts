import { UserModel } from "~/functions/user";
import { createUser } from "~/library/jest/helpers";
import { CustomerServiceUpdate } from "./update";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerService", () => {
  beforeAll(async () => UserModel.ensureIndexes());

  it("Should update a user by customerId", async () => {
    const user = await createUser({ customerId: 123 });

    const updatedData = {
      aboutMeHtml: "test test",
    };

    const updatedUser = await CustomerServiceUpdate(
      { customerId: user.customerId },
      updatedData
    );

    expect(updatedUser.aboutMeHtml).toEqual(updatedData.aboutMeHtml);
  });
});
