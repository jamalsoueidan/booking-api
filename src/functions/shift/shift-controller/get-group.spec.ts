import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { createUserWithShiftGroup } from "~/library/jest/helpers";
import { Tag } from "../shift.types";
import {
  ShiftControllerGetGroup,
  ShiftControllerGetGroupRequest,
  ShiftControllerGetGroupResponse,
} from "./get-group";

require("~/library/jest/mongoose/mongodb.jest");

describe("ShiftControllerGetGroup", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  const tag = Tag.all_day;

  beforeEach(() => {
    context = createContext();
  });

  it("Should be able to get group", async () => {
    const { user, shifts } = await createUserWithShiftGroup({ tag });

    request = await createHttpRequest<ShiftControllerGetGroupRequest>({
      query: {
        groupId: shifts[0].groupId || "",
        userId: user._id.toString(),
      },
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ShiftControllerGetGroupResponse> =
      await ShiftControllerGetGroup(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.end).toStrictEqual(
      shifts[shifts.length - 1].end
    );
  });
});
