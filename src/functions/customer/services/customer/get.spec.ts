import { UserModel } from "~/functions/user";
import { createUser, getUserObject } from "~/library/jest/helpers";
import { CustomerServiceGet } from "./get";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerServiceGet", () => {
  const userData = getUserObject();

  beforeAll(async () => UserModel.ensureIndexes());

  it("Should get the customer by customerId", async () => {
    const user = await createUser({ customerId: 123 });
    const getUser = await CustomerServiceGet({
      customerId: user.customerId,
    });
    expect(user.customerId).toBe(getUser.customerId);
  });
});
