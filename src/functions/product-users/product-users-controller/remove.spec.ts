import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { login } from "~/library/jest/helpers";
import {
  createProductAndAddUser,
  createProductAndCreateUser,
} from "~/library/jest/helpers/product-users";
import {
  ProductUsersControllerRemove,
  ProductUsersControllerRemoveRequest,
  ProductUsersControllerRemoveResponse,
} from "./remove";

require("~/library/jest/mongoose/mongodb.jest");

const productId = 123456789;

describe("ProductUsersControllerRemove", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(async () => {
    context = createContext();
  });

  it("Owner: Should be able to remove any users from any product", async () => {
    const { product, user } = await createProductAndCreateUser({
      productId,
    });

    request = await createHttpRequest<ProductUsersControllerRemoveRequest>({
      query: {
        productId: product.productId,
        userId: user._id,
      },
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ProductUsersControllerRemoveResponse> =
      await ProductUsersControllerRemove(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.deletedCount).toBe(1);
  });

  it("User or Admin should be able to remove only their own user from products", async () => {
    const { token, user } = await login(AuthRole.user);

    await createProductAndAddUser({
      productId,
      userId: user?._id,
    });

    request = await createHttpRequest<ProductUsersControllerRemoveRequest>({
      query: {
        productId: productId,
        userId: user._id.toString(),
      },
      token,
    });

    const res: HttpSuccessResponse<ProductUsersControllerRemoveResponse> =
      await ProductUsersControllerRemove(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.deletedCount).toBe(1);
  });

  it("User or Admin should be able to remove only their own user from products", async () => {
    const { token } = await login(AuthRole.user);

    const { product, user } = await createProductAndCreateUser({
      productId,
    });

    request = await createHttpRequest<ProductUsersControllerRemoveRequest>({
      query: {
        productId: productId,
        userId: user._id,
      },
      token,
    });

    const res: HttpSuccessResponse<ProductUsersControllerRemoveResponse> =
      await ProductUsersControllerRemove(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.deletedCount).toBe(0);
  });
});
