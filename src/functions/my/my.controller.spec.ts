import { HttpRequest, InvocationContext } from "@azure/functions";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { AuthRole } from "../auth";
import {
  MyControllerGetAccount,
  MyControllerUpdateAccount,
  MyControllerUpdateAccountRequest,
  MyControllerUpdateAccountResponse,
} from "./my.controller";

require("~/library/jest/mongoose/mongodb.jest");

describe("MyControllerGetAccount", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(() => {
    context = createContext();
  });

  it("Should be able to get my user data", async () => {
    request = await createHttpRequest({
      login: AuthRole.user,
    });

    const res: HttpSuccessResponse = await MyControllerGetAccount(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
  });

  it("Should be able to update my user data", async () => {
    request = await createHttpRequest<MyControllerUpdateAccountRequest>({
      login: AuthRole.user,
      body: {
        fullname: "hej med dig",
      },
    });

    const res: HttpSuccessResponse<MyControllerUpdateAccountResponse> =
      await MyControllerUpdateAccount(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload?.fullname).toBe("hej med dig");
  });
});
