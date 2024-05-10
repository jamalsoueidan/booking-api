import { createUser, getUserObject } from "~/library/jest/helpers";
import { UserServiceUsernameTaken } from "./username-taken";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserServiceUsernameTaken", () => {
  it("check username is taken", async () => {
    const userData = getUserObject();

    await createUser(userData);

    let response = await UserServiceUsernameTaken({
      username: userData.username,
    });

    expect(response.usernameTaken).toBeTruthy();

    response = await UserServiceUsernameTaken({
      username: "testerne",
    });

    expect(response.usernameTaken).toBeFalsy();
  });
});
