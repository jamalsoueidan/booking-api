import { HttpRequest, InvocationContext } from "@azure/functions";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { createUser } from "~/library/jest/helpers";
import {
  UserControllerList,
  UserControllerListRequest,
  UserControllerListResponse,
} from "./list";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserControllerList", () => {
  let context: InvocationContext = createContext();
  let request: HttpRequest;

  it("Should be able to get all users", async () => {
    await createUser({ customerId: 123 }, { username: "test" });
    await createUser({ customerId: 321 }, { username: "asd" });
    request = await createHttpRequest<UserControllerListRequest>({});

    const res: HttpSuccessResponse<UserControllerListResponse> =
      await UserControllerList(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload).toHaveLength(2);
  });
});
