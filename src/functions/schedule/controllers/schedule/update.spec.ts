import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import { ScheduleServiceCreate } from "~/functions/schedule/services";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import {
  ScheduleControllerUpdate,
  ScheduleControllerUpdateRequest,
  ScheduleControllerUpdateResponse,
} from "./update";

require("~/library/jest/mongoose/mongodb.jest");

describe("ScheduleControllerUpdate", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(async () => {
    context = createContext();
  });

  it("should be able to update slots schedule", async () => {
    const newSchedule = await ScheduleServiceCreate({
      name: "asd",
      customerId: 123,
    });

    const updatedScheduleName = "Updated Test Schedule";
    const updatedScheduleData: ScheduleControllerUpdateRequest["body"] = {
      name: updatedScheduleName,
    };

    request = await createHttpRequest<ScheduleControllerUpdateRequest>({
      query: {
        customerId: 123,
        scheduleId: newSchedule._id,
      },
      body: updatedScheduleData,
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ScheduleControllerUpdateResponse> =
      await ScheduleControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.name).toHaveProperty(updatedScheduleName);
  });
});
