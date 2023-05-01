import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import { Tag } from "~/functions/shift";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { createProduct } from "~/library/jest/helpers";
import {
  ProductControllerGetAll,
  ProductControllerGetAllRequest,
  ProductControllerGetAllResponse,
} from "./get-all";

require("~/library/jest/mongoose/mongodb.jest");

const productId = 123456789;

describe("ProductControllerGetAll", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  const tag = Tag.all_day;

  beforeEach(async () => {
    context = createContext();
  });

  it("Owner: Should be able to get all products, both active and not active", async () => {
    await createProduct({ productId: 234243423 });
    await createProduct({ productId });

    request = await createHttpRequest<ProductControllerGetAllRequest>({
      query: {},
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ProductControllerGetAllResponse> =
      await ProductControllerGetAll(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.length).toBe(2);
  });

  it("User or Admin should be able to get all products, only active", async () => {
    await createProduct({ productId: 234243423 });
    await createProduct({ productId, active: false });

    request = await createHttpRequest<ProductControllerGetAllRequest>({
      query: {},
      loginAs: AuthRole.admin,
    });

    const res: HttpSuccessResponse<ProductControllerGetAllResponse> =
      await ProductControllerGetAll(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.length).toBe(1);
  });
});
