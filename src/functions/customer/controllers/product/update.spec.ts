import { HttpRequest, InvocationContext } from "@azure/functions";

import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import { TimeUnit } from "~/functions/schedule";
import { getProductObject } from "~/library/jest/helpers/product";
import { CustomerProductServiceAdd } from "../../services/product/add";
import { CustomerScheduleServiceCreate } from "../../services/schedule/create";
import {
  CustomerProductControllerUpdate,
  CustomerProductControllerUpdateRequest,
  CustomerProductControllerUpdateResponse,
} from "./update";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductControllerUpdate", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  const customerId = 123;
  const productId = 1000;

  beforeEach(async () => {
    context = createContext();
  });

  it("should be able to update product inside schedule", async () => {
    const newSchedule = await CustomerScheduleServiceCreate({
      name: "asd",
      customerId,
    });

    await CustomerProductServiceAdd(
      {
        customerId: newSchedule.customerId,
      },
      { ...getProductObject({ productId }), scheduleId: newSchedule._id }
    );

    request = await createHttpRequest<CustomerProductControllerUpdateRequest>({
      query: {
        customerId,
        productId: 1000,
      },
      body: {
        bookingPeriod: {
          unit: TimeUnit.WEEKS,
          value: 12,
        },
        duration: 12,
        description: "hej med dig",
        scheduleId: newSchedule._id,
      },
    });

    const res: HttpSuccessResponse<CustomerProductControllerUpdateResponse> =
      await CustomerProductControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();

    expect(res.jsonBody?.payload).toEqual(
      expect.objectContaining({
        bookingPeriod: {
          unit: TimeUnit.WEEKS,
          value: 12,
        },
        productId,
      })
    );
  });
});
