import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import { ScheduleServiceCreate } from "~/functions/schedule/services";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import {
  ScheduleControllerGet,
  ScheduleControllerGetRequest,
  ScheduleControllerGetResponse,
} from "./get";

require("~/library/jest/mongoose/mongodb.jest");

describe("ScheduleControllerGet", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  const customerId = 123;

  beforeEach(async () => {
    context = createContext();
  });

  it("should be able to create schedule", async () => {
    const newSchedule = await ScheduleServiceCreate({
      name: "Test Schedule 2",
      customerId,
    });

    request = await createHttpRequest<ScheduleControllerGetRequest>({
      query: {
        scheduleId: newSchedule._id,
        customerId,
      },
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ScheduleControllerGetResponse> =
      await ScheduleControllerGet(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload._id.toString()).toBe(
      newSchedule._id.toString()
    );
  });
});
