import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import { ScheduleServiceCreate } from "~/functions/schedule/services";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { ScheduleProductServiceCreateOrUpdate } from "../../services/product";
import {
  ScheduleProductControllerDestroy,
  ScheduleProductControllerDestroyRequest,
  ScheduleProductControllerDestroyResponse,
} from "./destroy";

require("~/library/jest/mongoose/mongodb.jest");

describe("ScheduleProductControllerDestroy", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(async () => {
    context = createContext();
  });

  it("should be able to destroy schedule", async () => {
    const newSchedule = await ScheduleServiceCreate({
      name: "asd",
      customerId: 123,
    });

    const newProduct = await ScheduleProductServiceCreateOrUpdate(
      { scheduleId: newSchedule._id, customerId: newSchedule.customerId },
      {
        productId: 123,
        visible: true,
        breakTime: 0,
        duration: 60,
      }
    );

    expect(newProduct?.products).toHaveLength(1);

    request = await createHttpRequest<ScheduleProductControllerDestroyRequest>({
      query: {
        customerId: newSchedule.customerId,
        scheduleId: newSchedule._id,
        productId: 123,
      },
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ScheduleProductControllerDestroyResponse> =
      await ScheduleProductControllerDestroy(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload?.products).toHaveLength(0);
  });
});
