import { HttpRequest, InvocationContext } from "@azure/functions";

import { TimeUnit } from "~/functions/schedule";

import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { createUser } from "~/library/jest/helpers";
import { getProductObject } from "~/library/jest/helpers/product";
import { createScheduleWithProducts } from "~/library/jest/helpers/schedule";
import {
  UserProductsControllerGet,
  UserProductsControllerGetRequest,
  UserProductsControllerGetResponse,
} from "./get";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserProductsControllerGet", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(async () => {
    context = createContext();
  });

  it("should be able to get product inside schedule", async () => {
    const user = await createUser();

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

    const newSchedule = await createScheduleWithProducts({
      name: "asd",
      customerId: user.customerId,
      products: [product],
    });

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
