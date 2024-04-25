import { HttpRequest, InvocationContext } from "@azure/functions";

import { TimeUnit } from "~/functions/schedule";

import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { getProductObject } from "~/library/jest/helpers/product";
import { CustomerProductServiceAdd } from "../../services/product/add";
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

  it("should be able to get schedule", async () => {
    const newSchedule = await CustomerScheduleServiceCreate({
      name: "asd",
      customerId: 123,
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

    request = await createHttpRequest<CustomerProductControllerGetRequest>({
      query: {
        customerId: newSchedule.customerId,
        productId: newProduct.productId,
      },
    });

    const res: HttpSuccessResponse<CustomerProductControllerGetResponse> =
      await CustomerProductControllerGet(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload?.productId).toBe(newProduct.productId);
  });
});
