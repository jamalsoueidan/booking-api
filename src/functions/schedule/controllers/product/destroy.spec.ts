import { HttpRequest, InvocationContext } from "@azure/functions";
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
  const productId = 1000;

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
      {
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
        productId,
      },
    });

    const res: HttpSuccessResponse<ScheduleProductControllerDestroyResponse> =
      await ScheduleProductControllerDestroy(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload?.products).toHaveLength(0);
  });
});
