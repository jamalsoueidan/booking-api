import { HttpRequest, InvocationContext } from "@azure/functions";
import {
  HttpErrorResponse,
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import { SlotWeekDays } from "~/functions/schedule";
import { ensureType } from "~/library/jest/helpers/mock";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { shopifyAdmin } from "~/library/shopify";
import { UpdateScheduleMetaobjectMutation } from "~/types/admin.generated";
import {
  CustomerScheduleSlotControllerUpdate,
  CustomerScheduleSlotControllerUpdateRequest,
  CustomerScheduleSlotControllerUpdateResponse,
} from "./update";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/library/shopify", () => ({
  shopifyAdmin: jest.fn().mockReturnValue({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin().request as jest.Mock;

describe("CustomerScheduleSlotControllerUpdate", () => {
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

    const updatedScheduleData: CustomerScheduleSlotControllerUpdateRequest["body"] =
      {
        slots: [
          {
            day: SlotWeekDays.WEDNESDAY,
            intervals: [
              {
                from: "10:00",
                to: "13:00",
              },
            ],
          },
        ],
      };

    mockRequest.mockResolvedValueOnce({
      data: ensureType<UpdateScheduleMetaobjectMutation>({
        metaobjectUpdate: {
          metaobject: {
            fields: [
              {
                value: newSchedule.name,
                key: "name",
              },
              {
                value: JSON.stringify(updatedScheduleData.slots),
                key: "slots",
              },
            ],
          },
        },
      }),
    });

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
    const newSchedule = await createSchedule({
      name: "asd",
      customerId: 123,
    });

    const updatedScheduleData: CustomerScheduleSlotControllerUpdateRequest["body"] =
      {
        slots: [
          {
            day: SlotWeekDays.WEDNESDAY,
            intervals: [
              {
                from: "10:00",
                to: "13:00",
              },
            ],
          },
          {
            day: SlotWeekDays.WEDNESDAY,
            intervals: [
              {
                from: "08:00",
                to: "12:00",
              },
            ],
          },
        ],
      };

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
    const newSchedule = await createSchedule({
      name: "asd",
      customerId: 123,
    });

    const updatedScheduleData: CustomerScheduleSlotControllerUpdateRequest["body"] =
      {
        slots: [
          {
            day: SlotWeekDays.WEDNESDAY,
            intervals: [
              {
                from: "14:00",
                to: "12:00",
              },
            ],
          },
        ],
      };

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
    const newSchedule = await createSchedule({
      name: "asd",
      customerId: 123,
    });

    const updatedScheduleData: CustomerScheduleSlotControllerUpdateRequest["body"] =
      {
        slots: [
          {
            day: SlotWeekDays.WEDNESDAY,
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
        ],
      };

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
