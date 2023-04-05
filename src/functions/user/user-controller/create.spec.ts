import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { getUserObject } from "~/library/jest/helpers";
import {
  UserControllerCreateUser,
  UserControllerCreateUserBody,
  UserControllerCreateUserRequest,
  UserControllerCreateUserResponse,
} from "./create";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserControllerCreateUser", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  let newUser: UserControllerCreateUserBody;

  beforeEach(() => {
    context = createContext();
    newUser = getUserObject();
  });

  it("Owner: Should be able to create user for all groups", async () => {
    request = await createHttpRequest<UserControllerCreateUserRequest>({
      body: newUser,
      login: AuthRole.owner,
    });

    const res: HttpSuccessResponse<UserControllerCreateUserResponse> =
      await UserControllerCreateUser(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.fullname).toEqual(newUser.fullname);
  });

  it("User: Should not able to create user", async () => {
    request = await createHttpRequest<UserControllerCreateUserRequest>({
      body: newUser,
      login: AuthRole.user,
    });

    const res: HttpSuccessResponse<UserControllerCreateUserResponse> =
      await UserControllerCreateUser(request, context);

    expect(res.jsonBody?.success).toBeFalsy();
    expect(res.jsonBody).toHaveProperty("error");
  });

  it("Admin: Should be able to create user in the same group", async () => {
    request = await createHttpRequest<UserControllerCreateUserRequest>({
      body: newUser,
      login: AuthRole.admin,
    });

    const res: HttpSuccessResponse<UserControllerCreateUserResponse> =
      await UserControllerCreateUser(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.fullname).toEqual(newUser.fullname);
  });

  it("Admin: Should NOT be able to create user in other group", async () => {
    request = await createHttpRequest<UserControllerCreateUserRequest>({
      body: { ...newUser, group: "another" },
      login: AuthRole.admin,
    });

    const res: HttpSuccessResponse<UserControllerCreateUserResponse> =
      await UserControllerCreateUser(request, context);

    expect(res.jsonBody?.success).toBeFalsy();
    expect(res.jsonBody).toHaveProperty("error");
  });
});
