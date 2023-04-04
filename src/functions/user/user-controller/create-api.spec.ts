import { HttpRequest, InvocationContext } from "@azure/functions";
import { faker } from "@faker-js/faker";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { UserControllerCreateUserBody } from "./create";
import {
  UserControllerCreateUserApi,
  UserControllerCreateUserApiRequest,
} from "./create-api";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserControllerCreateUserApi", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  let newUser: UserControllerCreateUserBody;

  beforeEach(() => {
    context = createContext();
    newUser = {
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
  });

  it("Apikey: Should be able to create any user", async () => {
    request = await createHttpRequest<UserControllerCreateUserApiRequest>({
      body: newUser,
    });

    const response: HttpSuccessResponse = await UserControllerCreateUserApi(
      request,
      context
    );

    expect(response.jsonBody?.success).toBeTruthy();
    expect(response.jsonBody).toHaveProperty("payload");
  });
});
