import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import { Tag } from "~/functions/shift";
import { User } from "~/functions/user";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import {
  createProduct,
  createShift,
  createUser,
  createUserWithShift,
  login,
} from "~/library/jest/helpers";
import { ProductServiceUpdate } from "../product.service";
import {
  ProductControllerGetAll,
  ProductControllerGetAllRequest,
  ProductControllerGetAllResponse,
} from "./get-all";

require("~/library/jest/mongoose/mongodb.jest");

const productId = 123456789;
const tag = Tag.all_day;

describe("ProductControllerGetAll", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  let user: User;
  const tag = Tag.all_day;

  beforeEach(async () => {
    context = createContext();
    user = await createUser();
  });

  it("Owner: Should be able to get all product", async () => {
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

    const productUpdated = await ProductServiceUpdate(product?._id, {
      users: [
        { userId: user._id, tag },
        { userId: user2._id, tag: Tag.end_of_week },
      ],
    });

    request = await createHttpRequest<ProductControllerGetAllRequest>({
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ProductControllerGetAllResponse> =
      await ProductControllerGetAll(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.length).toBe(1);
    expect(res.jsonBody?.payload[0].users.length).toBe(2);
  });

  it("User: Should be able to get all products that he is added to", async () => {
    const tag = Tag.end_of_week;
    const { token, user: loggedInUser } = await login(AuthRole.user);
    await createShift({
      userId: loggedInUser?._id.toString(),
      tag,
    });

    const product1 = await createProduct({ productId: 234243423 });
    const product2 = await createProduct({ productId: 893232 });

    const { user } = await createUserWithShift({
      group: "a",
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

    request = await createHttpRequest<ProductControllerGetAllRequest>({
      token,
    });

    const res: HttpSuccessResponse<ProductControllerGetAllResponse> =
      await ProductControllerGetAll(request, context);

    // check if any user belongs to another group in the response
    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.length).toBe(2);
  });

  it("Admin: Should be able to get all product that belongs to all user", async () => {
    const tag = Tag.end_of_week;
    const { token, user: loggedInUser } = await login(AuthRole.admin);
    await createShift({
      userId: loggedInUser?._id.toString(),
      tag,
    });

    const product1 = await createProduct({ productId: 234243423 });
    const product2 = await createProduct({ productId: 893232 });

    const { user } = await createUserWithShift({
      group: "a",
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

    request = await createHttpRequest<ProductControllerGetAllRequest>({
      token,
    });

    const res: HttpSuccessResponse<ProductControllerGetAllResponse> =
      await ProductControllerGetAll(request, context);

    console.log(JSON.stringify(res.jsonBody?.payload));
    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.length).toBe(2);
  });
});
