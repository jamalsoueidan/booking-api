import { HttpRequest, InvocationContext } from "@azure/functions";
import {
  HttpErrorResponse,
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import { CustomerScheduleServiceCreate } from "../../services/schedule/create";
import {
  CustomerScheduleSlotControllerUpdate,
  CustomerScheduleSlotControllerUpdateRequest,
  CustomerScheduleSlotControllerUpdateResponse,
} from "./update";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerScheduleSlotControllerUpdate", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(async () => {
    context = createContext();
  });

  it("should be able to update slots schedule", async () => {
    const newSchedule = await CustomerScheduleServiceCreate({
      name: "asd",
      customerId: 123,
    });

    const updatedScheduleData: CustomerScheduleSlotControllerUpdateRequest["body"] =
      [
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

    request =
      await createHttpRequest<CustomerScheduleSlotControllerUpdateRequest>({
        query: {
          customerId: 123,
          scheduleId: newSchedule._id,
        },
        body: updatedScheduleData,
      });

    const res: HttpSuccessResponse<CustomerScheduleSlotControllerUpdateResponse> =
      await CustomerScheduleSlotControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload?.slots).toHaveLength(1);
  });

  it("should throw error with duplcaited days within slots", async () => {
    const newSchedule = await CustomerScheduleServiceCreate({
      name: "asd",
      customerId: 123,
    });

    const updatedScheduleData: CustomerScheduleSlotControllerUpdateRequest["body"] =
      [
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

    request =
      await createHttpRequest<CustomerScheduleSlotControllerUpdateRequest>({
        query: {
          customerId: 123,
          scheduleId: newSchedule._id,
        },
        body: updatedScheduleData,
      });

    const res: HttpErrorResponse = await CustomerScheduleSlotControllerUpdate(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
    expect(res.jsonBody).toHaveProperty("errors");
  });

  it("should throw error with incorrect intervals within slots", async () => {
    const newSchedule = await CustomerScheduleServiceCreate({
      name: "asd",
      customerId: 123,
    });

    const updatedScheduleData: CustomerScheduleSlotControllerUpdateRequest["body"] =
      [
        {
          day: "wednesday",
          intervals: [
            {
              from: "14:00",
              to: "12:00",
            },
          ],
        },
      ];

    request =
      await createHttpRequest<CustomerScheduleSlotControllerUpdateRequest>({
        query: {
          customerId: 123,
          scheduleId: newSchedule._id,
        },
        body: updatedScheduleData,
      });

    const res: HttpErrorResponse = await CustomerScheduleSlotControllerUpdate(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
    expect(res.jsonBody).toHaveProperty("errors");
  });

  it("should throw error with intervals overlapping within slots", async () => {
    const newSchedule = await CustomerScheduleServiceCreate({
      name: "asd",
      customerId: 123,
    });

    const updatedScheduleData: CustomerScheduleSlotControllerUpdateRequest["body"] =
      [
        {
          day: "wednesday",
          intervals: [
            {
              from: "12:00",
              to: "15:00",
            },
            {
              from: "14:00",
              to: "16:00",
            },
          ],
        },
      ];

    request =
      await createHttpRequest<CustomerScheduleSlotControllerUpdateRequest>({
        query: {
          customerId: 123,
          scheduleId: newSchedule._id,
        },
        body: updatedScheduleData,
      });

    const res: HttpErrorResponse = await CustomerScheduleSlotControllerUpdate(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
    expect(res.jsonBody).toHaveProperty("errors");
  });
});
