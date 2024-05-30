import { HttpRequest, InvocationContext } from "@azure/functions";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import {
  CustomerScheduleControllerCreate,
  CustomerScheduleControllerCreateRequest,
  CustomerScheduleControllerCreateResponse,
} from "./create";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("../../orchestrations/schedule/create", () => ({
  CustomerScheduleCreateOrchestration: () => ({
    request: jest.fn(),
  }),
}));

describe("CustomerScheduleControllerCreate", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(async () => {
    context = createContext();
  });

  it("should be able to create schedule", async () => {
    request = await createHttpRequest<CustomerScheduleControllerCreateRequest>({
      query: {
        customerId: 123,
      },
      body: {
        name: "test",
      },
      context,
    });

    const res: HttpSuccessResponse<CustomerScheduleControllerCreateResponse> =
      await CustomerScheduleControllerCreate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload).toHaveProperty("_id");
  });
});
