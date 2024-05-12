import { HttpRequest, InvocationContext } from "@azure/functions";

import { TimeUnit } from "~/functions/schedule";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { getProductObject } from "~/library/jest/helpers/product";

import { createSchedule } from "~/library/jest/helpers/schedule";
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
    const newProduct = getProductObject({
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
    });

    const newSchedule = await createSchedule({
      name: "adsasd",
      customerId,
      products: [{ ...newProduct, productId: 1000 }],
    });

    const newSchedule2 = await createSchedule({
      name: "ads3sd",
      customerId,
      products: [
        { ...newProduct, productId: 1002 },
        { ...newProduct, productId: 1003 },
      ],
    });

    request = await createHttpRequest<CustomerProductsControllerListIdsRequest>(
      {
        query: { customerId },
      }
    );

    const res: HttpSuccessResponse<CustomerProductsControllerListIdsResponse> =
      await CustomerProductsControllerListIds(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload).toEqual([1000, 1002, 1003]);
  });
});
