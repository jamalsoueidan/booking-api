import { HttpRequest, InvocationContext } from "@azure/functions";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { createUser } from "~/library/jest/helpers";
import {
  CustomerControllerGet,
  CustomerControllerGetRequest,
  CustomerControllerGetResponse,
} from "./get";

require("~/library/jest/mongoose/mongodb.jest");

describe("CustomerControllerGet", () => {
  let context: InvocationContext = createContext();
  let request: HttpRequest;

  it("Should be able to get user by customerId", async () => {
    const user = await createUser({ customerId: 123 }, { username: "test" });
    request = await createHttpRequest<CustomerControllerGetRequest>({
      query: { customerId: 123 },
    });

    const res: HttpSuccessResponse<CustomerControllerGetResponse> =
      await CustomerControllerGet(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload?.fullname).toEqual(user.fullname);
  });
});
