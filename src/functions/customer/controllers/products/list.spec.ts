import { HttpRequest, InvocationContext } from "@azure/functions";

import { TimeUnit } from "~/functions/schedule";

import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import { getProductObject } from "~/library/jest/helpers/product";
import { createScheduleWithProducts } from "~/library/jest/helpers/schedule";
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

    const newSchedule = await createScheduleWithProducts({
      name: "adsasd",
      customerId,
      products: [{ ...newProduct, productId: 1000 }],
    });

    const newSchedule2 = await createScheduleWithProducts({
      name: "adsd",
      customerId,
      products: [
        { ...newProduct, productId: 1002 },
        { ...newProduct, productId: 1004 },
      ],
    });

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
