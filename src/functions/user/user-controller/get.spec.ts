import { HttpRequest, InvocationContext } from "@azure/functions";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { createUser } from "~/library/jest/helpers";
import {
  UserControllerGet,
  UserControllerGetRequest,
  UserControllerGetResponse,
} from "./get";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserControllerGet", () => {
  let context: InvocationContext = createContext();
  let request: HttpRequest;

  it("Owner: Should be able to get user by id in all groups", async () => {
    const user = await createUser({ customerId: 123 });
    request = await createHttpRequest<UserControllerGetRequest>({
      query: { customerId: user.customerId },
    });

    const res: HttpSuccessResponse<UserControllerGetResponse> =
      await UserControllerGet(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload?.fullname).toEqual(user.fullname);
  });
});
