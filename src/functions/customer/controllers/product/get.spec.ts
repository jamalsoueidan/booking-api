import { HttpRequest, InvocationContext } from "@azure/functions";

import { ScheduleProduct, TimeUnit } from "~/functions/schedule";

import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { CustomerProductServiceUpsert } from "../../services/product";
import { CustomerScheduleServiceCreate } from "../../services/schedule/create";
import {
  CustomerProductControllerGet,
  CustomerProductControllerGetRequest,
  CustomerProductControllerGetResponse,
} from "./get";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductControllerGet", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  const productId = 1000;
  const product: Omit<ScheduleProduct, "productId"> = {
    variantId: 1,
    duration: 60,
    breakTime: 0,
    noticePeriod: {
      value: 1,
      unit: TimeUnit.DAYS,
    },
    bookingPeriod: {
      value: 1,
      unit: TimeUnit.WEEKS,
    },
    locations: [],
  };

  beforeEach(async () => {
    context = createContext();
  });

  it("should be able to get schedule", async () => {
    const newSchedule = await CustomerScheduleServiceCreate({
      name: "asd",
      customerId: 123,
    });

    const newProduct = await CustomerProductServiceUpsert(
      {
        customerId: newSchedule.customerId,
        productId,
      },
      { ...product, scheduleId: newSchedule._id }
    );

    expect(newProduct?.scheduleId.toString()).toEqual(
      newSchedule._id.toString()
    );

    request = await createHttpRequest<CustomerProductControllerGetRequest>({
      query: {
        customerId: newSchedule.customerId,
        productId,
      },
    });

    const res: HttpSuccessResponse<CustomerProductControllerGetResponse> =
      await CustomerProductControllerGet(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload?.productId).toBe(productId);
  });
});
