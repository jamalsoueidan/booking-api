import { HttpRequest, InvocationContext } from "@azure/functions";

import { TimeUnit } from "~/functions/schedule";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { omitObjectIdProps } from "~/library/jest/helpers";

import { getProductObject } from "~/library/jest/helpers/product";
import { CustomerProductServiceAdd } from "../../services/product/add";
import { CustomerScheduleServiceCreate } from "../../services/schedule/create";
import {
  CustomerProductControllerDestroy,
  CustomerProductControllerDestroyRequest,
  CustomerProductControllerDestroyResponse,
} from "./destroy";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductControllerDestroy", () => {
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

  it("should be able to destroy schedule", async () => {
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

    expect(omitObjectIdProps(newProduct)).toMatchObject(
      omitObjectIdProps({
        ...product,
        productId: newProduct.productId,
        scheduleId: newSchedule._id,
        scheduleName: newSchedule.name,
      })
    );

    request = await createHttpRequest<CustomerProductControllerDestroyRequest>({
      query: {
        customerId: newSchedule.customerId,
        productId: product.productId,
      },
    });

    const res: HttpSuccessResponse<CustomerProductControllerDestroyResponse> =
      await CustomerProductControllerDestroy(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload?.modifiedCount).toBe(1);
  });
});
