import { HttpRequest, InvocationContext } from "@azure/functions";
import { addMonths, setHours } from "date-fns";
import { AuthRole } from "~/functions/auth";
import {
  HttpErrorResponse,
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import {
  createShiftGroup,
  createUserWithShiftGroup,
  login,
} from "~/library/jest/helpers";
import { Tag } from "../shift.types";
import {
  ShiftControllerUpdateGroup,
  ShiftControllerUpdateGroupRequest,
  ShiftControllerUpdateGroupResponse,
} from "./update-group";

require("~/library/jest/mongoose/mongodb.jest");

const date = setHours(new Date(), 12);
const start = date;
const end = addMonths(setHours(date, 15), 1);

describe("ShiftControllerUpdateGroup", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  const tag = Tag.all_day;

  beforeEach(() => {
    context = createContext();
  });

  it("Owner: Should be able to update group for any user", async () => {
    const { user, shifts } = await createUserWithShiftGroup({ tag });

    request = await createHttpRequest<ShiftControllerUpdateGroupRequest>({
      query: {
        groupId: shifts[0].groupId || "",
        userId: user._id,
      },
      body: {
        days: ["thursday", "friday"],
        end,
        start,
        tag,
      },
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ShiftControllerUpdateGroupResponse> =
      await ShiftControllerUpdateGroup(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.length).toBeGreaterThan(1);
  });

  it("Should NOT be able to update group with invalid props", async () => {
    const { user, shifts } = await createUserWithShiftGroup({ tag });

    request = await createHttpRequest<ShiftControllerUpdateGroupRequest>({
      query: {
        groupId: shifts[0].groupId || "",
        userId: user._id,
      },
      body: {
        days: [],
        end: "",
        start: "",
        tag,
      } as any,
      loginAs: AuthRole.owner,
    });

    const res: HttpErrorResponse = await ShiftControllerUpdateGroup(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
  });

  it("User: Should able to update group for himself", async () => {
    const { token, user } = await login(AuthRole.user);
    const shifts = await createShiftGroup({
      userId: user?._id.toString(),
      tag,
    });

    request = await createHttpRequest<ShiftControllerUpdateGroupRequest>({
      query: {
        groupId: shifts[0].groupId || "",
        userId: user?._id,
      },
      body: {
        days: ["monday"],
        end,
        start,
        tag,
      },
      token,
    });

    const res: HttpSuccessResponse<ShiftControllerUpdateGroupResponse> =
      await ShiftControllerUpdateGroup(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.length).toBeGreaterThan(1);
  });

  it("User: Should not able to update group for other user", async () => {
    const { user, shifts } = await createUserWithShiftGroup({
      tag,
    });

    request = await createHttpRequest<ShiftControllerUpdateGroupRequest>({
      query: {
        groupId: shifts[0].groupId || "",
        userId: user._id,
      },
      body: {
        days: ["monday"],
        end,
        start,
        tag,
      },
      loginAs: AuthRole.user,
    });

    const res: HttpErrorResponse = await ShiftControllerUpdateGroup(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
  });

  it("Admin: Should be able to update group for user in the same group", async () => {
    const { user, shifts } = await createUserWithShiftGroup({
      tag,
    });

    request = await createHttpRequest<ShiftControllerUpdateGroupRequest>({
      query: {
        groupId: shifts[0].groupId || "",
        userId: user._id,
      },
      body: {
        days: ["monday"],
        end,
        start,
        tag,
      },
      loginAs: AuthRole.admin,
    });

    const res: HttpSuccessResponse<ShiftControllerUpdateGroupResponse> =
      await ShiftControllerUpdateGroup(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.length).toBeGreaterThan(1);
  });

  it("Admin: Should NOT be able to update user in other group", async () => {
    const { user, shifts } = await createUserWithShiftGroup({
      group: "b",
      tag,
    });

    request = await createHttpRequest<ShiftControllerUpdateGroupRequest>({
      query: {
        groupId: shifts[0].groupId || "",
        userId: user._id,
      },
      body: {
        days: ["monday"],
        end,
        start,
        tag,
      },
      loginAs: AuthRole.admin,
    });

    const res: HttpErrorResponse = await ShiftControllerUpdateGroup(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
  });
});
