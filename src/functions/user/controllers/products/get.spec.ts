import { HttpRequest, InvocationContext } from "@azure/functions";
import { CustomerScheduleServiceCreate } from "~/functions/customer/services/schedule/create";

import { TimeUnit } from "~/functions/schedule";

import { CustomerProductServiceAdd } from "~/functions/customer/services/product/add";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { createUser } from "~/library/jest/helpers";
import { getProductObject } from "~/library/jest/helpers/product";
import {
  UserProductsControllerGet,
  UserProductsControllerGetRequest,
  UserProductsControllerGetResponse,
} from "./get";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserProductsControllerGet", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  const product = getProductObject({
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

  beforeEach(async () => {
    context = createContext();
  });

  it("should be able to get product inside schedule", async () => {
    const user = await createUser({ customerId: 134 });
    const newSchedule = await CustomerScheduleServiceCreate({
      name: "asd",
      customerId: user.customerId,
    });

    const newProduct = await CustomerProductServiceAdd(
      {
        customerId: newSchedule.customerId,
      },
      { ...product, scheduleId: newSchedule._id }
    );

    expect(newProduct?.scheduleId.toString()).toEqual(
      newSchedule._id.toString()
    );

    request = await createHttpRequest<UserProductsControllerGetRequest>({
      query: {
        username: user.username || "",
        productHandle: product.productHandle,
      },
    });

    const res: HttpSuccessResponse<UserProductsControllerGetResponse> =
      await UserProductsControllerGet(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload?.productId).toBe(product.productId);
  });
});
