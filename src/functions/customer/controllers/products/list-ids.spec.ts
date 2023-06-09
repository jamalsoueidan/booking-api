import { HttpRequest, InvocationContext } from "@azure/functions";
import { CustomerScheduleServiceCreate } from "~/functions/customer/services";
import { CustomerProductServiceUpsert } from "~/functions/customer/services/product";
import { ScheduleProduct, TimeUnit } from "~/functions/schedule";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import {
  CustomerProductsControllerListIds,
  CustomerProductsControllerListIdsRequest,
  CustomerProductsControllerListIdsResponse,
} from "./list-ids";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductsServiceListIds", () => {
  let context: InvocationContext = createContext();
  let request: HttpRequest;

  it("Should be able to get all productIds for customer-id in all schedules", async () => {
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

    request = await createHttpRequest<CustomerProductsControllerListIdsRequest>(
      {
        query: { customerId },
      }
    );

    const res: HttpSuccessResponse<CustomerProductsControllerListIdsResponse> =
      await CustomerProductsControllerListIds(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload).toEqual([1000, 1002, 1004]);
  });
});
