import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { createUser } from "~/library/jest/helpers";
import { IUserDocument } from "../user.schema";
import {
  UserControllerUpdate,
  UserControllerUpdateRequest,
  UserControllerUpdateResponse,
} from "./update";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserControllerUpdateRequest", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  let incorretUserGroup: IUserDocument;
  let correctUserGroup: IUserDocument;

  beforeEach(async () => {
    context = createContext();
    incorretUserGroup = await createUser({
      group: "a",
    });

    correctUserGroup = await createUser();
  });

  it("Owner: Should be able to update all users in any group", async () => {
    request = await createHttpRequest<UserControllerUpdateRequest>({
      loginAs: AuthRole.owner,
      query: {
        _id: incorretUserGroup._id,
      },
      body: {
        ...incorretUserGroup.toJSON(),
        fullname: "jamalssss",
        group: "test",
      },
    });

    const res: HttpSuccessResponse<UserControllerUpdateResponse> =
      await UserControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.fullname).toEqual("jamalssss");
    expect(res.jsonBody?.payload.group).toEqual("test");
  });

  it("User: Should not able to update other user", async () => {
    request = await createHttpRequest<UserControllerUpdateRequest>({
      loginAs: AuthRole.user,
      query: {
        _id: incorretUserGroup._id,
      },
      body: {
        ...incorretUserGroup.toJSON(),
        fullname: "jamal",
        group: "test",
      },
    });

    const res: HttpSuccessResponse<UserControllerUpdateResponse> =
      await UserControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeFalsy();
    expect(res.jsonBody).toHaveProperty("errors");
  });

  it("Admin: Should be able to update staff in the same group", async () => {
    request = await createHttpRequest<UserControllerUpdateRequest>({
      loginAs: AuthRole.admin,
      query: {
        _id: correctUserGroup._id,
      },
      body: {
        ...correctUserGroup.toJSON(),
        fullname: "jamalsss",
        group: "test",
      },
    });

    const res: HttpSuccessResponse<UserControllerUpdateResponse> =
      await UserControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.fullname).toEqual("jamalsss");
    expect(res.jsonBody?.payload.group).toEqual("all");
  });

  it("Admin: Should NOT be able to update user in other group", async () => {
    request = await createHttpRequest<UserControllerUpdateRequest>({
      loginAs: AuthRole.admin,
      query: {
        _id: incorretUserGroup._id,
      },
      body: {
        ...incorretUserGroup.toJSON(),
        fullname: "jamalssss",
        group: "test",
      },
    });

    const res: HttpSuccessResponse<UserControllerUpdateResponse> =
      await UserControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeFalsy();
    expect(res.jsonBody).toHaveProperty("errors");
  });
});
