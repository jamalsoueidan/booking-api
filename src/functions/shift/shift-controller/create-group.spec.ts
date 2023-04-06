import { HttpRequest, InvocationContext } from "@azure/functions";
import { addWeeks, set, startOfWeek } from "date-fns";
import { AuthRole } from "~/functions/auth";
import { User } from "~/functions/user";
import {
  HttpErrorResponse,
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { createUser } from "~/library/jest/helpers";
import { Tag } from "../shift.types";
import {
  ShiftControllerCreateGroup,
  ShiftControllerCreateGroupRequest,
  ShiftControllerCreateGroupResponse,
} from "./create-group";

require("~/library/jest/mongoose/mongodb.jest");

const date = startOfWeek(new Date());
const start = date;
const end = addWeeks(date, 2);

describe("ShiftControllerCreateGroup", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  let user: User;
  const tag = Tag.all_day;

  beforeEach(async () => {
    context = createContext();
    user = await createUser();
  });

  it("Owner should be able to create group for all users", async () => {
    request = await createHttpRequest<ShiftControllerCreateGroupRequest>({
      query: {
        userId: user._id,
      },
      body: {
        days: ["thursday", "friday"],
        end,
        start,
        tag,
      },
      login: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ShiftControllerCreateGroupResponse> =
      await ShiftControllerCreateGroup(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.length).toEqual(4);
  });

  it("Should handle winter time when creating group", async () => {
    request = await createHttpRequest<ShiftControllerCreateGroupRequest>({
      query: {
        userId: user._id,
      },
      body: {
        days: ["monday", "tuesday"],
        end: set(new Date(), {
          hours: 16,
          date: 25,
          month: 10,
        }),
        start: set(new Date(), {
          hours: 10,
          date: 25,
          month: 9,
        }),
        tag,
      },
      login: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ShiftControllerCreateGroupResponse> =
      await ShiftControllerCreateGroup(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.length).toEqual(8);
  });

  it("Should NOT be able to create group with invalid props", async () => {
    request = await createHttpRequest<any>({
      query: {
        userId: user._id,
      },
      body: {
        days: [],
        end: "",
        start: "",
        tag,
      },
      login: AuthRole.owner,
    });

    const res: HttpErrorResponse = await ShiftControllerCreateGroup(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
  });
});

/*describe("Application: schedule create group route test", () => {
  it("User: Should able to create group for himself", async () => {
    const loggedInUser = await createUser({
      group,
      role: UserRole.user,
    });

    const request = createAppExpress(scheduleRouteCreateGroup, loggedInUser);
    const res = await request
      .post(`/schedules/group?user=${loggedInUser.id}`)
      .send({
        days: ["thursday"],
        end,
        start,
        tag,
      })
      .set("Accept", "application/json");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.payload.length).toBeGreaterThan(1);
  });

  it("User: Should not able to create group for other", async () => {
    const loggedInUser = await createUser({
      group,
      role: UserRole.user,
    });

    const user = await createUser({
      group,
      role: UserRole.user,
    });

    const request = createAppExpress(scheduleRouteCreateGroup, loggedInUser);
    const res = await request
      .post(`/schedules/group?user=${user.id}`)
      .send({
        days: ["thursday"],
        end,
        start,
        tag,
      })
      .set("Accept", "application/json");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBeFalsy();
  });

  it("Admin: Should be able to create group for user in the same group", async () => {
    const loggedInUser = await createUser({
      group,
      role: UserRole.admin,
    });

    const user = await createUser({
      group,
      role: UserRole.user,
    });

    const request = createAppExpress(scheduleRouteCreateGroup, loggedInUser);
    const res = await request
      .post(`/schedules/group?user=${user.id}`)
      .send({
        days: ["monday"],
        end,
        start,
        tag,
      })
      .set("Accept", "application/json");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.payload.length).toBeGreaterThan(1);
  });

  it("Admin: Should NOT be able to create group user in other group", async () => {
    const loggedInUser = await createUser({
      group,
      role: UserRole.admin,
    });

    const user = await createUser({
      group: "b",
      role: UserRole.user,
    });

    const request = createAppExpress(scheduleRouteCreateGroup, loggedInUser);
    const res = await request
      .post(`/schedules/group?user=${user.id}`)
      .send({
        days: ["tuesday"],
        end,
        start,
        tag,
      })
      .set("Accept", "application/json");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBeFalsy();
  });
});
*/
