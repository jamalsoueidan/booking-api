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
  ProductControllerUpdate,
  ProductControllerUpdateRequest,
  ProductControllerUpdateResponse,
} from "./update";

require("~/library/jest/mongoose/mongodb.jest");

const productId = 123456789;

describe("ProductControllerUpdate", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  const tag = Tag.end_of_week;

  beforeEach(async () => {
    context = createContext();
  });

  it("Owner: Should be able to update product and insert any users", async () => {
    const product = await createProduct({ productId });

    request = await createHttpRequest<ProductControllerUpdateRequest>({
      query: {
        id: product._id,
      },
      body: {
        duration: 15,
      },
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ProductControllerUpdateResponse> =
      await ProductControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload).toHaveProperty("duration");
  });
});
