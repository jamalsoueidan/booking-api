import { HttpRequest, InvocationContext } from "@azure/functions";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { createUser } from "~/library/jest/helpers";
import {
  UserControllerSearch,
  UserControllerSearchRequest,
  UserControllerSearchResponse,
} from "./search";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserControllerSearch", () => {
  let context: InvocationContext = createContext();
  let request: HttpRequest;

  it("Should be able to get all users", async () => {
    for (let customerId = 0; customerId < 25; customerId++) {
      const user = await createUser(
        { customerId },
        { active: true, isBusiness: true }
      );
    }

    let request = await createHttpRequest<UserControllerSearchRequest>({
      query: { limit: 10 },
    });
    let res: HttpSuccessResponse<UserControllerSearchResponse> =
      await UserControllerSearch(request, context);

    expect(res.jsonBody?.payload.results.length).toBe(10);
    expect(res.jsonBody?.payload.totalCount).toBe(25);

    request = await createHttpRequest<UserControllerSearchRequest>({
      query: {
        nextCursor: res.jsonBody?.payload.nextCursor?.toJSON(),
        limit: 10,
      },
    });
    res = await UserControllerSearch(request, context);

    expect(res.jsonBody?.payload.results.length).toBe(10);

    request = await createHttpRequest<UserControllerSearchRequest>({
      query: {
        nextCursor: res.jsonBody?.payload.nextCursor?.toJSON(),
        limit: 10,
      },
    });
    res = await UserControllerSearch(request, context);

    expect(res.jsonBody?.payload.results.length).toBe(5);
  });
});
