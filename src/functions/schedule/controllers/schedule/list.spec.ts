import { HttpRequest, InvocationContext } from "@azure/functions";
import { ScheduleServiceCreate } from "~/functions/schedule/services";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import {
  ScheduleControllerList,
  ScheduleControllerListRequest,
  ScheduleControllerListResponse,
} from "./list";

require("~/library/jest/mongoose/mongodb.jest");

describe("ScheduleControllerList", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  const customerId = 123;

  beforeEach(async () => {
    context = createContext();
  });

  it("should be able to create schedule", async () => {
    await ScheduleServiceCreate({ name: "Test Schedule 2", customerId });

    request = await createHttpRequest<ScheduleControllerListRequest>({
      query: {
        customerId,
      },
    });

    const res: HttpSuccessResponse<ScheduleControllerListResponse> =
      await ScheduleControllerList(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload).toHaveLength(1);
  });
});
