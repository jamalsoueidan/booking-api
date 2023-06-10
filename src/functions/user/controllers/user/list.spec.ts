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
    for (let customerId = 0; customerId < 25; customerId++) {
      await createUser({ customerId }, { active: true, isBusiness: true });
    }

    let request = await createHttpRequest<UserControllerListRequest>({
      query: { limit: 10 },
    });
    let res: HttpSuccessResponse<UserControllerListResponse> =
      await UserControllerList(request, context);

    expect(res.jsonBody?.payload.results.length).toBe(10);

    request = await createHttpRequest<UserControllerListRequest>({
      query: {
        nextCursor: res.jsonBody?.payload.nextCursor?.toJSON(),
        limit: 10,
      },
    });
    res = await UserControllerList(request, context);

    expect(res.jsonBody?.payload.results.length).toBe(10);

    request = await createHttpRequest<UserControllerListRequest>({
      query: {
        nextCursor: res.jsonBody?.payload.nextCursor?.toJSON(),
        limit: 10,
      },
    });
    res = await UserControllerList(request, context);

    expect(res.jsonBody?.payload.results.length).toBe(5);
  });
});
