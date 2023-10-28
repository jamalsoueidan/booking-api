import { HttpRequest, InvocationContext } from "@azure/functions";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { CustomerScheduleServiceCreate } from "../../services/schedule/create";
import {
  CustomerScheduleControllerDestroy,
  CustomerScheduleControllerDestroyRequest,
  CustomerScheduleControllerDestroyResponse,
} from "./destroy";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerScheduleControllerDestroy", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(async () => {
    context = createContext();
  });

  it("should be able to destroy schedule", async () => {
    const newSchedule = await CustomerScheduleServiceCreate({
      name: "asd",
      customerId: 123,
    });

    request = await createHttpRequest<CustomerScheduleControllerDestroyRequest>(
      {
        query: {
          customerId: newSchedule.customerId,
          scheduleId: newSchedule._id,
        },
      }
    );

    const res: HttpSuccessResponse<CustomerScheduleControllerDestroyResponse> =
      await CustomerScheduleControllerDestroy(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.deletedCount).toBe(1);
  });
});
