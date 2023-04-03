import { HttpRequest, InvocationContext } from "@azure/functions";
import { faker } from "@faker-js/faker";
import { AuthRole } from "~/functions/auth/auth.types";
import {
  UserControllerCreateUser,
  UserControllerCreateUserApi,
} from "~/functions/user/user.controller";
import { UserCreateBody } from "~/functions/user/user.types";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

require("~/library/jest/mongoose/mongodb.jest");

describe("Shopify: user create route test", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(() => {
    context = createContext();
  });

  it("Apikey: Should be able to create any user", async () => {
    const newUser: UserCreateBody = {
      active: true,
      address: "asdiojdsajioadsoji",
      avatar: "http://",
      email: faker.internet.email(),
      fullname: faker.name.fullName(),
      group: "test",
      language: "da",
      phone: "+4531317411",
      position: "2",
      postal: 8000,
      timeZone: "Europe/Copenhagen",
    };

    request = await createHttpRequest({
      body: newUser,
    });

    const response: HttpSuccessResponse = await UserControllerCreateUserApi(
      request,
      context
    );

    expect(response.jsonBody?.success).toBeTruthy();
    expect(response.jsonBody).toHaveProperty("payload");
  });

  it("Owner: Should be able to create user for all groups", async () => {
    const newUser: UserCreateBody = {
      active: true,
      address: "asdiojdsajioadsoji",
      avatar: "http://",
      email: faker.internet.email(),
      fullname: faker.name.fullName(),
      group: "test",
      language: "da",
      phone: "+4531317411",
      position: "2",
      postal: 8000,
      timeZone: "Europe/Copenhagen",
    };

    request = await createHttpRequest(
      {
        body: newUser,
      },
      { role: AuthRole.owner }
    );

    const res: HttpSuccessResponse<UserCreateBody> =
      await UserControllerCreateUser(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.fullname).toEqual(newUser.fullname);
  });
});
