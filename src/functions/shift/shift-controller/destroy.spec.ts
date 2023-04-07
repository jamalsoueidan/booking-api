import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import {
  HttpErrorResponse,
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import {
  createShift,
  createUserWithShift,
  login,
} from "~/library/jest/helpers";
import { Tag } from "../shift.types";
import {
  ShiftControllerDestroy,
  ShiftControllerDestroyRequest,
  ShiftControllerDestroyResponse,
} from "./destroy";

require("~/library/jest/mongoose/mongodb.jest");

describe("ShiftControllerDestroy", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  const tag = Tag.all_day;

  beforeEach(() => {
    context = createContext();
  });

  it("Should be able to delete shift for user", async () => {
    const { user, shift } = await createUserWithShift({ tag });

    request = await createHttpRequest<ShiftControllerDestroyRequest>({
      query: {
        _id: shift._id,
        userId: user._id,
      },
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ShiftControllerDestroyResponse> =
      await ShiftControllerDestroy(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.deletedCount).toEqual(1);
  });

  it("User: Should able to delete shift for himself", async () => {
    const { token, user } = await login(AuthRole.user);
    const shift = await createShift({
      userId: user?._id.toString(),
      tag,
    });

    request = await createHttpRequest<ShiftControllerDestroyRequest>({
      query: {
        _id: shift._id,
        userId: user?._id,
      },
      token,
    });

    const res: HttpSuccessResponse<ShiftControllerDestroyResponse> =
      await ShiftControllerDestroy(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.deletedCount).toEqual(1);
  });

  it("User: Should not able to delete shift for other user", async () => {
    const { user, shift } = await createUserWithShift({
      group: "b",
      tag,
    });

    request = await createHttpRequest<ShiftControllerDestroyRequest>({
      query: {
        _id: shift._id,
        userId: user?._id,
      },
      loginAs: AuthRole.user,
    });

    const res: HttpErrorResponse = await ShiftControllerDestroy(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
  });

  it("Admin: Should be able to delete shift for user in the same group", async () => {
    const { user, shift } = await createUserWithShift({
      tag,
    });

    request = await createHttpRequest<ShiftControllerDestroyRequest>({
      query: {
        _id: shift._id,
        userId: user?._id,
      },
      loginAs: AuthRole.admin,
    });

    const res: HttpSuccessResponse<ShiftControllerDestroyResponse> =
      await ShiftControllerDestroy(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.deletedCount).toEqual(1);
  });

  it("Admin: Should NOT be able to delete user in other group", async () => {
    const { user, shift } = await createUserWithShift({
      group: "b",
      tag,
    });

    request = await createHttpRequest<ShiftControllerDestroyRequest>({
      query: {
        _id: shift._id,
        userId: user?._id,
      },
      loginAs: AuthRole.admin,
    });

    const res: HttpErrorResponse = await ShiftControllerDestroy(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
  });
});
