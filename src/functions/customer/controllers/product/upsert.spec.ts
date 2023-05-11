import { HttpRequest, InvocationContext } from "@azure/functions";

import { ScheduleServiceCreate } from "~/functions/schedule/services";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import { ScheduleProduct, TimeUnit } from "~/functions/schedule";
import {
  CustomerProductControllerUpsert,
  CustomerProductControllerUpsertRequest,
  CustomerProductControllerUpsertResponse,
} from "./upsert";

require("~/library/jest/mongoose/mongodb.jest");

describe("ScheduleProductControllerUpdate", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  const customerId = 123;
  const name = "Test Schedule";
  const productId = 1000;
  const newProduct: Omit<ScheduleProduct, "productId"> = {
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

  it("should be able to update slots schedule", async () => {
    const newSchedule = await ScheduleServiceCreate({
      name: "asd",
      customerId,
    });

    request = await createHttpRequest<CustomerProductControllerUpsertRequest>({
      query: {
        customerId,
        productId: "1000",
      } as any,
      body: { ...newProduct, scheduleId: newSchedule._id },
    });

    const res: HttpSuccessResponse<CustomerProductControllerUpsertResponse> =
      await CustomerProductControllerUpsert(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload).toMatchObject({ productId, ...newProduct });
  });
});
