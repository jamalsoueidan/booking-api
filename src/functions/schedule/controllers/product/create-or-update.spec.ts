import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import { ScheduleServiceCreate } from "~/functions/schedule/services";
import {
  HttpErrorResponse,
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import { ScheduleProductServiceCreateOrUpdate } from "~/functions/schedule/services/product";
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

  beforeEach(async () => {
    context = createContext();
  });

  it("should be able to update slots schedule", async () => {
    const newSchedule = await ScheduleServiceCreate({
      name: "asd",
      customerId,
    });

    const updatedScheduleData: ScheduleProductControllerCreateOrUpdateRequest["body"] =
      {
        visible: true,
        duration: 60,
        breakTime: 0,
      };

    request =
      await createHttpRequest<ScheduleProductControllerCreateOrUpdateRequest>({
        query: {
          customerId,
          scheduleId: newSchedule._id,
          productId,
        },
        body: updatedScheduleData,
        loginAs: AuthRole.owner,
      });

    const res: HttpSuccessResponse<ScheduleProductControllerCreateOrUpdateResponse> =
      await ScheduleProductControllerCreateOrUpdate(request, context);

    const foundProduct = res.jsonBody?.payload?.products.find(
      (p) => p.productId === productId
    );

    expect(res.jsonBody?.success).toBeTruthy();
    expect(JSON.stringify(foundProduct)).toEqual(
      JSON.stringify({ productId, ...updatedScheduleData })
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

    const newProduct = {
      visible: true,
      duration: 60,
      breakTime: 0,
    };

    // Add the same product to the first schedule
    await ScheduleProductServiceCreateOrUpdate(
      {
        scheduleId: newSchedule1._id,
        customerId: newSchedule1.customerId,
        productId,
      },
      newProduct
    );

    const updatedScheduleData: ScheduleProductControllerCreateOrUpdateRequest["body"] =
      {
        visible: true,
        duration: 60,
        breakTime: 0,
      };

    request =
      await createHttpRequest<ScheduleProductControllerCreateOrUpdateRequest>({
        query: {
          customerId: 123,
          scheduleId: newSchedule2._id,
          productId,
        },
        body: updatedScheduleData,
        loginAs: AuthRole.owner,
      });

    const res: HttpErrorResponse =
      await ScheduleProductControllerCreateOrUpdate(request, context);

    expect(res.jsonBody?.success).toBeFalsy();
    expect(res.jsonBody).toHaveProperty("errors");
  });
});
