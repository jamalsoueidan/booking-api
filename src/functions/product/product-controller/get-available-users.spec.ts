import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import { Tag } from "~/functions/shift";
import {
  HttpErrorResponse,
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import {
  createProduct,
  createShift,
  createUserWithShift,
  login,
} from "~/library/jest/helpers";
import { ProductServiceUpdate } from "../product.service";
import { ProductControllerGetAllResponse } from "./get-all";
import {
  ProductControllerGetAvailableUsers,
  ProductControllerGetAvailableUsersRequest,
} from "./get-available-users";

require("~/library/jest/mongoose/mongodb.jest");

const productId = 123456789;
const tag = Tag.all_day;

describe("ProductControllerGetAvailableUsers", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  const tag = Tag.end_of_week;

  beforeEach(async () => {
    context = createContext();
  });

  it("Owner: Should be able to get all available user for product", async () => {
    await createProduct({ productId: 234243423 });
    const product = await createProduct({ productId });

    const { user } = await createUserWithShift({
      group: "a",
      tag,
    });

    const { user: user2 } = await createUserWithShift({
      group: "b",
      tag,
    });

    await ProductServiceUpdate(product?._id, {
      users: [
        { userId: user._id, tag },
        { userId: user2._id, tag: Tag.end_of_week },
      ],
    });

    request =
      await createHttpRequest<ProductControllerGetAvailableUsersRequest>({
        query: {},
        loginAs: AuthRole.owner,
      });

    const res: HttpSuccessResponse<ProductControllerGetAllResponse> =
      await ProductControllerGetAvailableUsers(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.length).toBe(2);
  });

  it("User: Should NOT be able to access get-available-users", async () => {
    const { token, user: loggedInUser } = await login(AuthRole.user);
    await createShift({
      userId: loggedInUser?._id.toString(),
      tag,
    });

    request =
      await createHttpRequest<ProductControllerGetAvailableUsersRequest>({
        query: {},
        token,
      });

    const res: HttpErrorResponse = await ProductControllerGetAvailableUsers(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
  });

  it("Admin: Should be able to get all product that belongs to all user", async () => {
    const { token, user: loggedInUser } = await login(AuthRole.admin);
    await createShift({
      userId: loggedInUser?._id.toString(),
      tag,
    });

    const product1 = await createProduct({ productId: 234243423 });
    const product2 = await createProduct({ productId: 893232 });

    const { user } = await createUserWithShift({
      group: "b",
      tag,
    });

    await ProductServiceUpdate(product1?._id, {
      users: [
        { userId: user._id, tag },
        { userId: loggedInUser?._id, tag },
      ],
    });

    await ProductServiceUpdate(product2?._id, {
      users: [{ userId: user._id, tag }],
    });

    request =
      await createHttpRequest<ProductControllerGetAvailableUsersRequest>({
        query: {},
        token,
      });

    const res: HttpSuccessResponse<ProductControllerGetAllResponse> =
      await ProductControllerGetAvailableUsers(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.length).toBe(1);
  });
});
