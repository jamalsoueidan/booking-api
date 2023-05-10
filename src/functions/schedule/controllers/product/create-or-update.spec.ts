import { HttpRequest, InvocationContext } from "@azure/functions";

import { ScheduleServiceCreate } from "~/functions/schedule/services";
import {
  HttpErrorResponse,
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import { ScheduleProductServiceCreateOrUpdate } from "~/functions/schedule/services/product";
import { ScheduleProduct, TimeUnit } from "../../schedule.types";
import {
  ScheduleProductControllerCreateOrUpdate,
  ScheduleProductControllerCreateOrUpdateRequest,
  ScheduleProductControllerCreateOrUpdateResponse,
} from "./create-or-update";

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

    request =
      await createHttpRequest<ScheduleProductControllerCreateOrUpdateRequest>({
        query: {
          customerId,
          scheduleId: newSchedule._id,
          productId: "1000",
        } as any,
        body: newProduct,
      });

    const res: HttpSuccessResponse<ScheduleProductControllerCreateOrUpdateResponse> =
      await ScheduleProductControllerCreateOrUpdate(request, context);

    const foundProduct = res.jsonBody?.payload?.products.find(
      (p) => p.productId === productId
    );

    expect(res.jsonBody?.success).toBeTruthy();
    expect(JSON.stringify(foundProduct)).toEqual(
      JSON.stringify({ productId, ...newProduct })
    );
  });

  it("should throw error with duplcaited days within slots", async () => {
    const newSchedule1 = await ScheduleServiceCreate({
      name: "Test Schedule 1",
      customerId,
    });
    const newSchedule2 = await ScheduleServiceCreate({
      name: "Test Schedule 2",
      customerId,
    });

    // Add the same product to the first schedule
    await ScheduleProductServiceCreateOrUpdate(
      {
        scheduleId: newSchedule1._id,
        customerId: newSchedule1.customerId,
        productId,
      },
      newProduct
    );

    request =
      await createHttpRequest<ScheduleProductControllerCreateOrUpdateRequest>({
        query: {
          customerId: 123,
          scheduleId: newSchedule2._id,
          productId,
        },
        body: newProduct,
      });

    const res: HttpErrorResponse =
      await ScheduleProductControllerCreateOrUpdate(request, context);

    expect(res.jsonBody?.success).toBeFalsy();
    expect(res.jsonBody).toHaveProperty("errors");
  });
});
