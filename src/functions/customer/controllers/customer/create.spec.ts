import { HttpRequest, InvocationContext } from "@azure/functions";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import { getUserObject } from "~/library/jest/helpers";
import {
  CustomerControllerCreate,
  CustomerControllerCreateRequest,
  CustomerControllerCreateResponse,
} from "./create";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("../../orchestrations/customer/create", () => ({
  CustomerCreateOrchestration: () => ({
    request: jest.fn(),
  }),
}));

describe("CustomerControllerCreate", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(() => {
    context = createContext();
  });

  it("Should be able to create user", async () => {
    const userData = getUserObject();

    request = await createHttpRequest<CustomerControllerCreateRequest>({
      body: userData,
      context,
    });

    const res: HttpSuccessResponse<CustomerControllerCreateResponse> =
      await CustomerControllerCreate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
  });
});
