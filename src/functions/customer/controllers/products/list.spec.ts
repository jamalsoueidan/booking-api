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
  CustomerProductsControllerList,
  CustomerProductsControllerListRequest,
  CustomerProductsControllerListResponse,
} from "./list";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserProductsControllerList", () => {
  let context: InvocationContext = createContext();
  let request: HttpRequest;

  it("Should be able to get all products for customer-id in all schedules", async () => {
    const customerId = 123;
    const newProduct: Omit<ScheduleProduct, "productId"> = {
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

    const newSchedule = await CustomerScheduleServiceCreate({
      name: "ab",
      customerId,
    });

    await CustomerProductServiceUpsert(
      {
        customerId: newSchedule.customerId,
        productId: 1000,
      },
      { ...newProduct, scheduleId: newSchedule._id }
    );

    const newSchedule2 = await CustomerScheduleServiceCreate({
      name: "tdd",
      customerId,
    });

    await CustomerProductServiceUpsert(
      {
        customerId: newSchedule2.customerId,
        productId: 1002,
      },
      { ...newProduct, scheduleId: newSchedule2._id }
    );

    await CustomerProductServiceUpsert(
      {
        customerId: newSchedule2.customerId,
        productId: 1004,
      },
      { ...newProduct, scheduleId: newSchedule2._id }
    );

    request = await createHttpRequest<CustomerProductsControllerListRequest>({
      query: { customerId },
    });

    const res: HttpSuccessResponse<CustomerProductsControllerListResponse> =
      await CustomerProductsControllerList(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload).toHaveLength(3);
  });
});
