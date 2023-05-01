import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import { Tag } from "~/functions/shift";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import {
  createProduct,
  createUserWithShift,
  login,
} from "~/library/jest/helpers";
import {
  ProductUsersControllerAdd,
  ProductUsersControllerAddRequest,
  ProductUsersControllerAddResponse,
} from "./add";

require("~/library/jest/mongoose/mongodb.jest");

const productId = 123456789;

describe("ProductUsersControllerAdd", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(async () => {
    context = createContext();
  });

  it("Owner: Should be able to get add any users to any product", async () => {
    await createProduct({ productId });
    const { user } = await createUserWithShift({ tag: Tag.all_day });

    request = await createHttpRequest<ProductUsersControllerAddRequest>({
      body: {
        productId,
        userId: user._id.toString(),
        tag: Tag.all_day,
      },
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ProductUsersControllerAddResponse> =
      await ProductUsersControllerAdd(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.productId).toBe(productId);
  });

  it("User or Admin should be able to add only their own user to any product that are active", async () => {
    await createProduct({ productId });
    const { token, user } = await login(AuthRole.user);

    request = await createHttpRequest<ProductUsersControllerAddRequest>({
      body: {
        productId,
        userId: user?._id.toString(),
        tag: Tag.all_day,
      },
      token,
    });

    const res: HttpSuccessResponse<ProductUsersControllerAddResponse> =
      await ProductUsersControllerAdd(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.productId).toBe(productId);
  });
});
