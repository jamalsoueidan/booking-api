import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import {
  HttpErrorResponse,
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { createUserWithShift } from "~/library/jest/helpers";
import { Tag } from "../shift.types";
import {
  ShiftControllerGetAll,
  ShiftControllerGetAllRequest,
  ShiftControllerGetAllResponse,
} from "./get-all";

require("~/library/jest/mongoose/mongodb.jest");

describe("ShiftControllerGetAll", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  const tag = Tag.all_day;

  beforeEach(() => {
    context = createContext();
  });

  it("The Owner should be able to get all shifts for specific user", async () => {
    const { shift } = await createUserWithShift({ tag });

    request = await createHttpRequest<ShiftControllerGetAllRequest>({
      query: {
        start: shift.start,
        end: shift.end,
        userId: shift.userId.toString(),
      },
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ShiftControllerGetAllResponse> =
      await ShiftControllerGetAll(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.length).toEqual(1);
  });

  it("Should throw error when any param is missing", async () => {
    request = await createHttpRequest({
      loginAs: AuthRole.owner,
    });

    const res: HttpErrorResponse = await ShiftControllerGetAll(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
    expect(res.jsonBody?.error.length).toEqual(3);
  });

  it("User should be able to access shifts for other users within the same group.", async () => {
    const { shift } = await createUserWithShift({ tag });

    request = await createHttpRequest<ShiftControllerGetAllRequest>({
      query: {
        start: shift.start,
        end: shift.end,
        userId: shift.userId.toString(),
      },
      loginAs: AuthRole.user,
    });

    const res: HttpSuccessResponse<ShiftControllerGetAllResponse> =
      await ShiftControllerGetAll(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.length).toEqual(1);
  });

  it("User should NOT be able to get shift for user in other groups", async () => {
    const { shift } = await createUserWithShift({ group: "blah", tag });

    request = await createHttpRequest<ShiftControllerGetAllRequest>({
      query: {
        start: shift.start,
        end: shift.end,
        userId: shift.userId.toString(),
      },
      loginAs: AuthRole.user,
    });

    const res: HttpErrorResponse = await ShiftControllerGetAll(
      request,
      context
    );

    expect(res.jsonBody).toHaveProperty("error");
    expect(res.jsonBody?.success).toBeFalsy();
  });

  it("Admin should be able to access shifts for other users within the same group.", async () => {
    const { shift } = await createUserWithShift({ tag });

    request = await createHttpRequest<ShiftControllerGetAllRequest>({
      query: {
        start: shift.start,
        end: shift.end,
        userId: shift.userId.toString(),
      },
      loginAs: AuthRole.admin,
    });

    const res: HttpSuccessResponse<ShiftControllerGetAllResponse> =
      await ShiftControllerGetAll(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.length).toEqual(1);
  });

  it("Admin should NOT be able to get shift for user in other groups", async () => {
    const { shift } = await createUserWithShift({ group: "blah", tag });

    request = await createHttpRequest<ShiftControllerGetAllRequest>({
      query: {
        start: shift.start,
        end: shift.end,
        userId: shift.userId.toString(),
      },
      loginAs: AuthRole.admin,
    });

    const res: HttpErrorResponse = await ShiftControllerGetAll(
      request,
      context
    );

    expect(res.jsonBody).toHaveProperty("error");
    expect(res.jsonBody?.success).toBeFalsy();
  });
});
