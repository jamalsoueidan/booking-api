import { HttpRequest, InvocationContext } from "@azure/functions";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import {
  ScheduleControllerCreate,
  ScheduleControllerCreateRequest,
  ScheduleControllerCreateResponse,
} from "./create";

require("~/library/jest/mongoose/mongodb.jest");

describe("ScheduleControllerCreate", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(async () => {
    context = createContext();
  });

  it("should be able to create schedule", async () => {
    request = await createHttpRequest<ScheduleControllerCreateRequest>({
      query: {
        customerId: 123,
      },
      body: {
        name: "test",
      },
    });

    const res: HttpSuccessResponse<ScheduleControllerCreateResponse> =
      await ScheduleControllerCreate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload).toHaveProperty("_id");
  });
});
