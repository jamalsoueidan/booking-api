import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { createUser } from "~/library/jest/helpers";
import {
  UserControllerGetAllUsers,
  UserControllerGetAllUsersRequest,
  UserControllerGetAllUsersResponse,
} from "./get-all";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserControllerGetAllUsers", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(() => {
    context = createContext();
  });

  it("Owner: Should be able to get all user in all groups", async () => {
    await createUser({
      group: "a",
    });
    await createUser({
      group: "b",
    });

    request = await createHttpRequest<UserControllerGetAllUsersRequest>({
      login: AuthRole.owner,
    });

    const res: HttpSuccessResponse<UserControllerGetAllUsersResponse> =
      await UserControllerGetAllUsers(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.length).toEqual(3);
  });

  it("User: Should be able to get all user in the same group", async () => {
    await createUser();
    await createUser({
      group: "b",
    });

    request = await createHttpRequest<UserControllerGetAllUsersRequest>({
      login: AuthRole.user,
    });

    const res: HttpSuccessResponse<UserControllerGetAllUsersResponse> =
      await UserControllerGetAllUsers(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.length).toEqual(2); // group
  });

  it("Admin: Should be able to get all user in the same group", async () => {
    await createUser();
    await createUser({
      group: "b",
    });

    request = await createHttpRequest<UserControllerGetAllUsersRequest>({
      login: AuthRole.admin,
    });

    const res: HttpSuccessResponse<UserControllerGetAllUsersResponse> =
      await UserControllerGetAllUsers(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.length).toEqual(2); // group
  });
});
