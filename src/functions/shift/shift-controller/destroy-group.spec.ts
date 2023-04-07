import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import {
  HttpErrorResponse,
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import {
  DEFAULT_GROUP,
  createShiftGroup,
  createUserWithShiftGroup,
  login,
} from "~/library/jest/helpers";
import { Tag } from "../shift.types";
import {
  ShiftControllerDestroyGroup,
  ShiftControllerDestroyGroupRequest,
  ShiftControllerDestroyGroupResponse,
} from "./destroy-group";

require("~/library/jest/mongoose/mongodb.jest");

describe("ShiftControllerDestroyGroup", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  const tag = Tag.all_day;

  beforeEach(() => {
    context = createContext();
  });
  it("Should be able to delete group for all users", async () => {
    const { user, shifts } = await createUserWithShiftGroup({ tag });

    request = await createHttpRequest<ShiftControllerDestroyGroupRequest>({
      query: {
        groupId: shifts[0].groupId || "",
        userId: user._id,
      },
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ShiftControllerDestroyGroupResponse> =
      await ShiftControllerDestroyGroup(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.deletedCount).toBeGreaterThan(1);
  });

  it("User: Should able to delete group for himself", async () => {
    const { token, user } = await login(AuthRole.user);
    const shifts = await createShiftGroup({
      userId: user?._id.toString(),
      tag,
    });

    request = await createHttpRequest<ShiftControllerDestroyGroupRequest>({
      query: {
        groupId: shifts[0].groupId || "",
        userId: user?._id,
      },
      token,
    });

    const res: HttpSuccessResponse<ShiftControllerDestroyGroupResponse> =
      await ShiftControllerDestroyGroup(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.deletedCount).toBeGreaterThan(1);
  });

  it("User: Should not able to delete group for other user", async () => {
    const { user, shifts } = await createUserWithShiftGroup({
      group: "b",
      tag,
    });

    request = await createHttpRequest<ShiftControllerDestroyGroupRequest>({
      query: {
        groupId: shifts[0].groupId || "",
        userId: user._id,
      },
      loginAs: AuthRole.user,
    });

    const res: HttpErrorResponse = await ShiftControllerDestroyGroup(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
  });

  it("Admin: Should be able to delete group for user in the same group", async () => {
    const { user, shifts } = await createUserWithShiftGroup({
      group: DEFAULT_GROUP,
      tag,
    });

    request = await createHttpRequest<ShiftControllerDestroyGroupRequest>({
      query: {
        groupId: shifts[0].groupId || "",
        userId: user._id,
      },
      loginAs: AuthRole.admin,
    });

    const res: HttpSuccessResponse<ShiftControllerDestroyGroupResponse> =
      await ShiftControllerDestroyGroup(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.deletedCount).toBeGreaterThan(1);
  });

  it("Admin: Should NOT be able to delete group for user in other group", async () => {
    const { user, shifts } = await createUserWithShiftGroup({
      group: "b",
      tag,
    });

    request = await createHttpRequest<ShiftControllerDestroyGroupRequest>({
      query: {
        groupId: shifts[0].groupId || "",
        userId: user._id,
      },
      loginAs: AuthRole.admin,
    });

    const res: HttpErrorResponse = await ShiftControllerDestroyGroup(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
  });
});
