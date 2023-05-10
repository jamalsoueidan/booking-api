import { HttpRequest, InvocationContext } from "@azure/functions";
import { ScheduleProduct, TimeUnit } from "~/functions/schedule";
import {
  ScheduleProductServiceCreateOrUpdate,
  ScheduleServiceCreate,
} from "~/functions/schedule/services";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import {
  CustomerProductControllerDestroy,
  CustomerProductControllerDestroyRequest,
  CustomerProductControllerDestroyResponse,
} from "./destroy";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerProductControllerDestroy", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  const productId = 1000;
  const product: Omit<ScheduleProduct, "productId"> = {
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
  };

  beforeEach(async () => {
    context = createContext();
  });

  it("should be able to destroy schedule", async () => {
    const newSchedule = await ScheduleServiceCreate({
      name: "asd",
      customerId: 123,
    });

    const newProduct = await ScheduleProductServiceCreateOrUpdate(
      {
        scheduleId: newSchedule._id,
        customerId: newSchedule.customerId,
        productId,
      },
      product
    );

    expect(newProduct?.products).toHaveLength(1);

    request = await createHttpRequest<CustomerProductControllerDestroyRequest>({
      query: {
        customerId: newSchedule.customerId,
        scheduleId: newSchedule._id,
        productId,
      },
    });

    const res: HttpSuccessResponse<CustomerProductControllerDestroyResponse> =
      await CustomerProductControllerDestroy(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload?.products).toHaveLength(0);
  });
});
