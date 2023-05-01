import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { createProduct, createUser, login } from "~/library/jest/helpers";
import { addUserToProduct } from "~/library/jest/helpers/product-users";
import {
  ProductUsersControllerGetAll,
  ProductUsersControllerGetAllRequest,
  ProductUsersControllerGetAllResponse,
} from "./get-all";

require("~/library/jest/mongoose/mongodb.jest");

const productId = 123456789;

describe("ProductUsersControllerGetAll", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(async () => {
    context = createContext();
  });

  it("Owner: Should be able to get user with the associated products", async () => {
    const user = await createUser();
    const product1 = await createProduct({ productId });
    const product2 = await createProduct({ productId: 123 });
    const product3 = await createProduct({ productId: 321 });
    await addUserToProduct({ productId, userId: user._id });
    await addUserToProduct({ productId: 123, userId: user._id });
    await addUserToProduct({ productId: 321, userId: user._id });

    request = await createHttpRequest<ProductUsersControllerGetAllRequest>({
      query: {
        userId: user._id,
      },
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ProductUsersControllerGetAllResponse> =
      await ProductUsersControllerGetAll(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.length).toBe(3);
  });

  it("User or Admin should be able to get all products that he is added to", async () => {
    const { token, user } = await login(AuthRole.user);
    const product1 = await createProduct({ productId });
    const product2 = await createProduct({ productId: 123 });
    await addUserToProduct({ productId, userId: user._id });
    await addUserToProduct({ productId: 123, userId: user._id });

    request = await createHttpRequest<ProductUsersControllerGetAllRequest>({
      query: {
        userId: user._id,
      },
      token,
    });

    const res: HttpSuccessResponse<ProductUsersControllerGetAllResponse> =
      await ProductUsersControllerGetAll(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.length).toBe(2);
  });
});
