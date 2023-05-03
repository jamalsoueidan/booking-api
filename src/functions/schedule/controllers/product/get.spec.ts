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
  ScheduleProductControllerGet,
  ScheduleProductControllerGetRequest,
  ScheduleProductControllerGetResponse,
} from "./get";

require("~/library/jest/mongoose/mongodb.jest");

describe("ScheduleProductControllerGet", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  const productId = 1000;

  beforeEach(async () => {
    context = createContext();
  });

  it("should be able to get schedule", async () => {
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

    request = await createHttpRequest<ScheduleProductControllerGetRequest>({
      query: {
        customerId: newSchedule.customerId,
        scheduleId: newSchedule._id,
        productId,
      },
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ScheduleProductControllerGetResponse> =
      await ScheduleProductControllerGet(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload?.productId).toBe(productId);
  });
});
