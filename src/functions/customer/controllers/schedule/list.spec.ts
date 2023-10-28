import { HttpRequest, InvocationContext } from "@azure/functions";

import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import { CustomerScheduleServiceCreate } from "../../services/schedule/create";
import {
  CustomerScheduleControllerList,
  CustomerScheduleControllerListRequest,
  CustomerScheduleControllerListResponse,
} from "./list";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerScheduleControllerList", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  const customerId = 123;

  beforeEach(async () => {
    context = createContext();
  });

  it("should be able to get all schedules for customer", async () => {
    await CustomerScheduleServiceCreate({
      name: "Test Schedule 2",
      customerId,
    });

    request = await createHttpRequest<CustomerScheduleControllerListRequest>({
      query: {
        customerId,
      },
    });

    const res: HttpSuccessResponse<CustomerScheduleControllerListResponse> =
      await CustomerScheduleControllerList(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload).toHaveLength(1);
  });
});
