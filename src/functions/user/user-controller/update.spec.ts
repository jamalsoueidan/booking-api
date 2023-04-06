import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import { User } from "~/functions/user/user.types";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { createUser } from "~/library/jest/helpers";
import {
  UserControllerUpdate,
  UserControllerUpdateRequest,
  UserControllerUpdateResponse,
} from "./update";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserControllerUpdateRequest", () => {
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

  it("Owner: Should be able to update staff for all groups", async () => {
    request = await createHttpRequest<UserControllerUpdateRequest>({
      loginAs: AuthRole.owner,
      query: {
        _id: incorretUserGroup._id,
      },
      body: {
        fullname: "jamal",
        group: "test",
      },
    });

    const res: HttpSuccessResponse<UserControllerUpdateResponse> =
      await UserControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.fullname).toEqual("jamal");
    expect(res.jsonBody?.payload.group).toEqual("test");
  });

  it("User: Should not able to update other staff", async () => {
    request = await createHttpRequest<UserControllerUpdateRequest>({
      loginAs: AuthRole.user,
      query: {
        _id: incorretUserGroup._id,
      },
      body: {
        fullname: "jamal",
        group: "test",
      },
    });

    const res: HttpSuccessResponse<UserControllerUpdateResponse> =
      await UserControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeFalsy();
    expect(res.jsonBody).toHaveProperty("error");
  });

  it("Admin: Should be able to update staff in the same group", async () => {
    request = await createHttpRequest<UserControllerUpdateRequest>({
      loginAs: AuthRole.admin,
      query: {
        _id: correctUserGroup._id,
      },
      body: {
        fullname: "jamal",
        group: "test",
      },
    });

    const res: HttpSuccessResponse<UserControllerUpdateResponse> =
      await UserControllerUpdate(request, context);

    expect(res.jsonBody?.payload.fullname).toEqual("jamal");
    expect(res.jsonBody?.payload.group).toEqual("all");
  });

  it("Admin: Should NOT be able to update staff in other group", async () => {
    request = await createHttpRequest<UserControllerUpdateRequest>({
      loginAs: AuthRole.admin,
      query: {
        _id: incorretUserGroup._id,
      },
      body: {
        fullname: "jamal",
        group: "test",
      },
    });

    const res: HttpSuccessResponse<UserControllerUpdateResponse> =
      await UserControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeFalsy();
    expect(res.jsonBody).toHaveProperty("error");
  });
});
