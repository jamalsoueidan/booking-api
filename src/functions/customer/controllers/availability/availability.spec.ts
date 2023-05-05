import { HttpRequest, InvocationContext } from "@azure/functions";
import { ScheduleModel } from "~/functions/schedule";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import {
  CustomerProductAvailabilityControllerGet,
  CustomerProductAvailabilityControllerGetRequest,
  CustomerProductAvailabilityControllerGetResponse,
} from "./availability";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductAvailabilityControllerGet", () => {
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
        visible: true,
      },
    ],
  };

  beforeEach(() => {
    context = createContext();
  });

  it("Should be able to get availability for product for customer", async () => {
    await ScheduleModel.create(scheduleData);
    const startDate = new Date("2023-05-01T00:00:00Z");

    request =
      await createHttpRequest<CustomerProductAvailabilityControllerGetRequest>({
        query: {
          customerId,
          productId,
          startDate,
        },
      });

    const res: HttpSuccessResponse<CustomerProductAvailabilityControllerGetResponse> =
      await CustomerProductAvailabilityControllerGet(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.length).toBeGreaterThan(0);
  });
});
