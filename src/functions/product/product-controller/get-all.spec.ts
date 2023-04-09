import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import { Tag } from "~/functions/shift";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import {
  DEFAULT_GROUP,
  createProduct,
  createShift,
  createUserWithShift,
  login,
} from "~/library/jest/helpers";
import {
  ProductServiceGetAllReturn,
  ProductServiceUpdate,
} from "../product.service";
import {
  ProductControllerGetAll,
  ProductControllerGetAllRequest,
  ProductControllerGetAllResponse,
} from "./get-all";

require("~/library/jest/mongoose/mongodb.jest");

const productId = 123456789;

const getAllGroups = (products: ProductServiceGetAllReturn) => {
  return products.reduce((acc, product) => {
    product.users.forEach((user) => {
      if (!acc.includes(user.group)) {
        acc.push(user.group);
      }
    });
    return acc;
  }, [] as string[]).length;
};

describe("ProductControllerGetAll", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  const tag = Tag.all_day;

  beforeEach(async () => {
    context = createContext();
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

    await ProductServiceUpdate(product?._id, {
      users: [
        { userId: user._id, tag },
        { userId: user2._id, tag: Tag.end_of_week },
      ],
    });

    request = await createHttpRequest<ProductControllerGetAllRequest>({
      query: {},
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
      query: {},
      token,
    });

    const res: HttpSuccessResponse<ProductControllerGetAllResponse> =
      await ProductControllerGetAll(request, context);

    expect(getAllGroups(res.jsonBody?.payload || [])).toBe(1);
    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.length).toBe(1);
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

    const { user: user2 } = await createUserWithShift({
      group: DEFAULT_GROUP,
      tag,
    });

    await ProductServiceUpdate(product1?._id, {
      users: [
        { userId: user._id, tag },
        { userId: loggedInUser?._id, tag },
      ],
    });

    await ProductServiceUpdate(product2?._id, {
      users: [
        { userId: user._id, tag },
        { userId: user2._id, tag },
      ],
    });

    request = await createHttpRequest<ProductControllerGetAllRequest>({
      query: {},
      token,
    });

    const res: HttpSuccessResponse<ProductControllerGetAllResponse> =
      await ProductControllerGetAll(request, context);

    expect(getAllGroups(res.jsonBody?.payload || [])).toBe(1);
    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.length).toBe(2);

    const product = res.jsonBody?.payload.find(
      ({ productId }) => productId === 893232
    );
    expect(product?.users[0].fullname).toEqual(user2.fullname);
  });
});
