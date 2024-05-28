import { HttpRequest, InvocationContext } from "@azure/functions";

import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import { ensureType } from "~/library/jest/helpers/mock";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { shopifyAdmin } from "~/library/shopify";
import { UpdateScheduleMetaobjectMutation } from "~/types/admin.generated";
import {
  CustomerScheduleControllerUpdate,
  CustomerScheduleControllerUpdateRequest,
  CustomerScheduleControllerUpdateResponse,
} from "./update";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/library/shopify", () => ({
  shopifyAdmin: jest.fn().mockReturnValue({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin().request as jest.Mock;

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

    mockRequest.mockResolvedValueOnce({
      data: ensureType<UpdateScheduleMetaobjectMutation>({
        metaobjectUpdate: {
          metaobject: {
            fields: [
              {
                value: updatedScheduleName,
                key: "name",
              },
              {
                value: JSON.stringify([
                  {
                    day: "monday",
                    intervals: [
                      {
                        to: "16:00",
                        from: "08:00",
                      },
                    ],
                  },
                ]),
                key: "slots",
              },
            ],
          },
        },
      }),
    });

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
