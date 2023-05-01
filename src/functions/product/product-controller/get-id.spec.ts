import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { createProduct } from "~/library/jest/helpers";
import {
  ProductControllerGetById,
  ProductControllerGetByIdRequest,
  ProductControllerGetByIdResponse,
} from "./get-id";

require("~/library/jest/mongoose/mongodb.jest");

const productId = 123456789;

describe("ProductControllerGetById", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(async () => {
    context = createContext();
  });

  it("Should be able to get product with all users", async () => {
    const product = await createProduct({ productId });

    request = await createHttpRequest<ProductControllerGetByIdRequest>({
      query: {
        id: product._id,
      },
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ProductControllerGetByIdResponse> =
      await ProductControllerGetById(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.productId).toBe(product.productId);
  });
});
