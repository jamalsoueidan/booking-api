import { HttpRequest, InvocationContext } from "@azure/functions";
import { Schedule, ScheduleModel, TimeUnit } from "~/functions/schedule";
import { UserModel } from "~/functions/user";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { createLocation } from "~/library/jest/helpers/location";
import {
  CustomerAvailabilityControllerGet,
  CustomerAvailabilityControllerGetRequest,
  CustomerAvailabilityControllerGetResponse,
} from "./get";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductControllerAvailability", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  const productId = 99;
  const customerId = 1;
  const scheduleData: Omit<Schedule, "_id"> = {
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
        variantId: 1,
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
        locations: [],
      },
    ],
  };

  beforeEach(async () => {
    context = createContext();
    await UserModel.create({ customerId, fullname: "jamal soueidan" });
  });

  it("Should be able to get availability for product for customer", async () => {
    const location = await createLocation({ customerId });
    await ScheduleModel.create(scheduleData);
    const startDate = "2023-05-01T00:00:00Z";

    request = await createHttpRequest<CustomerAvailabilityControllerGetRequest>(
      {
        query: {
          customerId,
          locationId: location._id,
        },
        body: { productIds: [productId], startDate },
      }
    );

    const res: HttpSuccessResponse<CustomerAvailabilityControllerGetResponse> =
      await CustomerAvailabilityControllerGet(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload.length).toBeGreaterThan(0);
  });
});
