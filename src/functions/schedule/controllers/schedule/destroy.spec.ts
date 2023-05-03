import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import { ScheduleServiceCreate } from "~/functions/schedule/services";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import {
  ScheduleControllerDestroy,
  ScheduleControllerDestroyRequest,
  ScheduleControllerDestroyResponse,
} from "./destroy";

require("~/library/jest/mongoose/mongodb.jest");

describe("ScheduleControllerDestroy", () => {
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

    request = await createHttpRequest<ScheduleControllerDestroyRequest>({
      query: {
        customerId: newSchedule.customerId,
        scheduleId: newSchedule._id,
      },
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ScheduleControllerDestroyResponse> =
      await ScheduleControllerDestroy(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.deletedCount).toBe(1);
  });
});
