import { HttpRequest, InvocationContext } from "@azure/functions";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { createUser } from "~/library/jest/helpers";
import {
  CustomerControllerList,
  CustomerControllerListRequest,
  CustomerControllerListResponse,
} from "./list";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerControllerList", () => {
  let context: InvocationContext = createContext();
  let request: HttpRequest;

  it("Should be able to get all users", async () => {
    await createUser({ customerId: 123 }, { username: "test" });
    await createUser({ customerId: 321 }, { username: "asd" });
    request = await createHttpRequest<CustomerControllerListRequest>({});

    const res: HttpSuccessResponse<CustomerControllerListResponse> =
      await CustomerControllerList(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload).toHaveLength(2);
  });
});
