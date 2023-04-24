import { HttpRequest, InvocationContext } from "@azure/functions";
import { setHours, setMilliseconds, setSeconds } from "date-fns";
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
import { resetTime } from "../shift.helper";
import { Tag } from "../shift.types";
import {
  ShiftControllerGetById,
  ShiftControllerGetByIdRequest,
  ShiftControllerGetByIdResponse,
} from "./get-by-id";

require("~/library/jest/mongoose/mongodb.jest");

const tag = Tag.all_day;
const date = setHours(resetTime(new Date()), 10);

describe("ShiftControllerGetById", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(() => {
    context = createContext();
  });

  it("Owner: Should be able to get shift for any user", async () => {
    const { user, shift } = await createUserWithShift({ tag });

    request = await createHttpRequest<ShiftControllerGetByIdRequest>({
      query: {
        _id: shift._id || "",
        userId: user._id,
      },
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ShiftControllerGetByIdResponse> =
      await ShiftControllerGetById(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload?._id).toEqual(shift._id);
  });

  it("User: Should able to get shift for himself", async () => {
    const { token, user } = await login(AuthRole.user);
    const shift = await createShift({
      userId: user?._id.toString(),
      tag,
    });

    request = await createHttpRequest<ShiftControllerGetByIdRequest>({
      query: {
        _id: shift._id || "",
        userId: user?._id,
      },
      token,
    });

    const res: HttpSuccessResponse<ShiftControllerGetByIdResponse> =
      await ShiftControllerGetById(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload?.start).toEqual(
      setSeconds(setMilliseconds(date, 0), 0)
    );
  });

  it("User: Should not able to get shift for other user", async () => {
    const { user, shift } = await createUserWithShift({
      tag,
    });

    request = await createHttpRequest<ShiftControllerGetByIdRequest>({
      query: {
        _id: shift._id || "",
        userId: user._id,
      },
      loginAs: AuthRole.user,
    });

    const res: HttpErrorResponse = await ShiftControllerGetById(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
  });

  it("Admin: Should be able to get shift for user in the same group", async () => {
    const { user, shift } = await createUserWithShift({
      tag,
    });

    request = await createHttpRequest<ShiftControllerGetByIdRequest>({
      query: {
        _id: shift._id || "",
        userId: user._id,
      },
      loginAs: AuthRole.admin,
    });

    const res: HttpSuccessResponse<ShiftControllerGetByIdResponse> =
      await ShiftControllerGetById(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload?.start).toEqual(
      setSeconds(setMilliseconds(date, 0), 0)
    );
  });

  it("Admin: Should NOT be able to get user in other group", async () => {
    const { user, shift } = await createUserWithShift({
      group: "b",
      tag,
    });

    request = await createHttpRequest<ShiftControllerGetByIdRequest>({
      query: {
        _id: shift._id || "",
        userId: user._id,
      },
      loginAs: AuthRole.admin,
    });

    const res: HttpErrorResponse = await ShiftControllerGetById(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
  });
});
