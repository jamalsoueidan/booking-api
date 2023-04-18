import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import { User } from "~/functions/user/user.types";
import {
  HttpErrorResponse,
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { createUser } from "~/library/jest/helpers";
import {
  UserControllerGetById,
  UserControllerGetByIdRequest,
  UserControllerGetByIdResponse,
} from "./get-by-id";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserControllerGetById", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  let incorretUserGroup: User;
  let correctUserGroup: User;

  beforeEach(async () => {
    context = createContext();
    incorretUserGroup = await createUser({
      group: "a",
    });

    correctUserGroup = await createUser();
  });

  it("Owner: Should be able to get user by id in all groups", async () => {
    request = await createHttpRequest<UserControllerGetByIdRequest>({
      loginAs: AuthRole.owner,
      query: { _id: incorretUserGroup._id },
    });

    const res: HttpSuccessResponse<UserControllerGetByIdResponse> =
      await UserControllerGetById(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload?.fullname).toEqual(incorretUserGroup.fullname);
  });

  it("User: Should be able to get user by id in the same group", async () => {
    request = await createHttpRequest<UserControllerGetByIdRequest>({
      loginAs: AuthRole.user,
      query: { _id: correctUserGroup._id },
    });

    const res: HttpSuccessResponse<UserControllerGetByIdResponse> =
      await UserControllerGetById(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload?.fullname).toEqual(correctUserGroup.fullname);
  });

  it("User: Should NOT be able to get by id in the other group", async () => {
    request = await createHttpRequest<UserControllerGetByIdRequest>({
      loginAs: AuthRole.user,
      query: { _id: incorretUserGroup._id },
    });

    const res: HttpErrorResponse = await UserControllerGetById(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
    expect(res.jsonBody).toHaveProperty("errors");
  });

  it("Admin: Should be able to get user by id in the same group", async () => {
    request = await createHttpRequest<UserControllerGetByIdRequest>({
      loginAs: AuthRole.admin,
      query: { _id: correctUserGroup._id },
    });

    const res: HttpSuccessResponse<UserControllerGetByIdResponse> =
      await UserControllerGetById(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.fullname).toEqual(correctUserGroup.fullname);
  });

  it("Admin: Should NOT be able to get user by id in the other group", async () => {
    request = await createHttpRequest<UserControllerGetByIdRequest>({
      loginAs: AuthRole.admin,
      query: { _id: incorretUserGroup._id },
    });

    const res: HttpErrorResponse = await UserControllerGetById(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
    expect(res.jsonBody).toHaveProperty("errors");
  });
});
