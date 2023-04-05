import { HttpRequest, InvocationContext } from "@azure/functions";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { getUserObject } from "~/library/jest/helpers";
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
    newUser = getUserObject();
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
