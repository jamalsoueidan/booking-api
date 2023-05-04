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

  it("Should be able to get user by username", async () => {
    const user = await createUser({ customerId: 123 }, { username: "test" });
    request = await createHttpRequest<UserControllerGetRequest>({
      query: { username: user.username },
    });

    const res: HttpSuccessResponse<UserControllerGetResponse> =
      await UserControllerGet(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload?.fullname).toEqual(user.fullname);
  });
});
