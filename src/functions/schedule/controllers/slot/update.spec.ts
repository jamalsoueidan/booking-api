import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import { ScheduleServiceCreate } from "~/functions/schedule/services";
import {
  HttpErrorResponse,
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import {
  ScheduleControllerUpdateSlot,
  ScheduleControllerUpdateSlotRequest,
  ScheduleControllerUpdateSlotResponse,
} from "./update";

require("~/library/jest/mongoose/mongodb.jest");

describe("ScheduleControllerUpdateSlot", () => {
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

    const updatedScheduleData: ScheduleControllerUpdateSlotRequest["body"] = [
      {
        day: "wednesday",
        intervals: [
          {
            from: "10:00",
            to: "13:00",
          },
        ],
      },
    ];

    request = await createHttpRequest<ScheduleControllerUpdateSlotRequest>({
      query: {
        customerId: 123,
        scheduleId: newSchedule._id,
      },
      body: updatedScheduleData,
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ScheduleControllerUpdateSlotResponse> =
      await ScheduleControllerUpdateSlot(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload?.slots).toHaveLength(1);
  });

  it("should throw error with duplcaited days within slots", async () => {
    const newSchedule = await ScheduleServiceCreate({
      name: "asd",
      customerId: 123,
    });

    const updatedScheduleData: ScheduleControllerUpdateSlotRequest["body"] = [
      {
        day: "wednesday",
        intervals: [
          {
            from: "10:00",
            to: "13:00",
          },
        ],
      },
      {
        day: "wednesday",
        intervals: [
          {
            from: "08:00",
            to: "12:00",
          },
        ],
      },
    ];

    request = await createHttpRequest<ScheduleControllerUpdateSlotRequest>({
      query: {
        customerId: 123,
        scheduleId: newSchedule._id,
      },
      body: updatedScheduleData,
      loginAs: AuthRole.owner,
    });

    const res: HttpErrorResponse = await ScheduleControllerUpdateSlot(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
    expect(res.jsonBody).toHaveProperty("errors");
  });
});
