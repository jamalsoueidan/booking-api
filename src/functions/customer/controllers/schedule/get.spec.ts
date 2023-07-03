import { HttpRequest, InvocationContext } from "@azure/functions";
import { CustomerScheduleServiceCreate } from "~/functions/customer/services";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import {
  CustomerScheduleControllerGet,
  CustomerScheduleControllerGetRequest,
  CustomerScheduleControllerGetResponse,
} from "./get";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerScheduleControllerGet", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  const customerId = 123;

  beforeEach(async () => {
    context = createContext();
  });

  it("should be able to create schedule", async () => {
    const newSchedule = await CustomerScheduleServiceCreate({
      name: "Test Schedule 2",
      customerId,
    });

    request = await createHttpRequest<CustomerScheduleControllerGetRequest>({
      query: {
        scheduleId: newSchedule._id,
        customerId,
      },
    });

    const res: HttpSuccessResponse<CustomerScheduleControllerGetResponse> =
      await CustomerScheduleControllerGet(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload._id.toString()).toBe(
      newSchedule._id.toString()
    );
  });
});
