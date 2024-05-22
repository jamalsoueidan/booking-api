import { HttpRequest, InvocationContext } from "@azure/functions";

import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import { createSchedule } from "~/library/jest/helpers/schedule";
import {
  CustomerScheduleControllerUpdate,
  CustomerScheduleControllerUpdateRequest,
  CustomerScheduleControllerUpdateResponse,
} from "./update";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerScheduleControllerUpdate", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(async () => {
    context = createContext();
  });

  it("should be able to update slots schedule", async () => {
    const newSchedule = await createSchedule({
      name: "asd",
      customerId: 123,
    });

    const updatedScheduleName = "Updated Test Schedule";
    const updatedScheduleData: CustomerScheduleControllerUpdateRequest["body"] =
      {
        name: updatedScheduleName,
      };

    request = await createHttpRequest<CustomerScheduleControllerUpdateRequest>({
      query: {
        customerId: 123,
        scheduleId: newSchedule._id,
      },
      body: updatedScheduleData,
    });

    const res: HttpSuccessResponse<CustomerScheduleControllerUpdateResponse> =
      await CustomerScheduleControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.name).toBe(updatedScheduleName);
  });
});
