import { createUser } from "~/library/jest/helpers";

import { UserServiceFilterSearch } from "./search";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserServiceFilterSearch", () => {
  it("Should be to search for usernams and fullname", async () => {
    let user;
    for (let customerId = 0; customerId < 25; customerId++) {
      user = await createUser(
        { customerId },
        {
          active: true,
          isBusiness: true,
        }
      );
    }

    if (user) {
      //by username
      let search = user.username.substring(0, 5);
      let results = await UserServiceFilterSearch({
        search,
      });

      let allUsernamesContainMarlene = results.every((result) =>
        new RegExp(`${search}`, "i").test(result.username)
      );

      expect(allUsernamesContainMarlene).toBe(true);

      //by fullname
      search = user.fullname.substring(0, 5);
      results = await UserServiceFilterSearch({
        search,
      });

      allUsernamesContainMarlene = results.every((result) =>
        new RegExp(`${search}`, "i").test(result.fullname)
      );

      expect(allUsernamesContainMarlene).toBe(true);
    }
  });
});
