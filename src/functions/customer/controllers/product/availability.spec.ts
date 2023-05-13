import { HttpRequest, InvocationContext } from "@azure/functions";
import { ScheduleModel, TimeUnit } from "~/functions/schedule";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import {
  CustomerProductControllerAvailability,
  CustomerProductControllerAvailabilityRequest,
  CustomerProductControllerAvailabilityResponse,
} from "./availability";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductControllerAvailability", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  const productId = 99;
  const customerId = 1;
  const scheduleData = {
    name: "Test Schedule",
    customerId,
    slots: [
      {
        day: "friday",
        intervals: [
          {
            from: "08:00",
            to: "12:00",
          },
          {
            from: "14:00",
            to: "18:00",
          },
        ],
      },
    ],
    products: [
      {
        productId,
        duration: 30,
        breakTime: 0,
        noticePeriod: {
          unit: TimeUnit.DAYS,
          value: 1,
        },
        bookingPeriod: {
          unit: TimeUnit.WEEKS,
          value: 1,
        },
      },
    ],
  };

  beforeEach(() => {
    context = createContext();
  });

  it("Should be able to get availability for product for customer", async () => {
    await ScheduleModel.create(scheduleData);
    const startDate = "2023-05-01T00:00:00Z";

    request =
      await createHttpRequest<CustomerProductControllerAvailabilityRequest>({
        query: {
          customerId,
          productIds: [productId],
          startDate,
        },
      });

    const res: HttpSuccessResponse<CustomerProductControllerAvailabilityResponse> =
      await CustomerProductControllerAvailability(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.length).toBeGreaterThan(0);
  });
});
