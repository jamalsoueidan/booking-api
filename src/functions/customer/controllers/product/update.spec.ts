import { HttpRequest, InvocationContext } from "@azure/functions";

import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import { TimeUnit } from "~/functions/schedule";
import { createUser } from "~/library/jest/helpers";
import {
  createLocation,
  getDumbLocationObject,
} from "~/library/jest/helpers/location";
import { getProductObject } from "~/library/jest/helpers/product";
import { createScheduleWithProducts } from "~/library/jest/helpers/schedule";
import {
  CustomerProductControllerUpdate,
  CustomerProductControllerUpdateRequest,
  CustomerProductControllerUpdateResponse,
} from "./update";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("../../orchestrations/product/update", () => ({
  CustomerProductUpdateOrchestration: () => ({
    request: jest.fn(),
  }),
}));

describe("CustomerProductControllerUpdate", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  const customerId = 123;
  const productId = 1000;

  beforeEach(async () => {
    context = createContext();
    jest.clearAllMocks();
  });

  it("should be able to update product inside schedule", async () => {
    const user = await createUser({ customerId });
    const location = await createLocation({ customerId: user.customerId });

    const product = getProductObject({
      productId,
      locations: [
        getDumbLocationObject({
          ...location,
          location: location._id,
        }),
      ],
    });

    await createScheduleWithProducts({
      name: "adsasd",
      customerId,
      products: [product],
    });

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
      },
      context,
      request,
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
