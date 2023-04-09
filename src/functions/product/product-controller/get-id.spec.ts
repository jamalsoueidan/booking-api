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
  DEFAULT_GROUP,
  createProduct,
  createUserWithShift,
  login,
} from "~/library/jest/helpers";
import { ProductServiceUpdate } from "../product.service";
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
  const tag = Tag.end_of_week;

  beforeEach(async () => {
    context = createContext();
  });

  it("Owner: Should be able to get product with all users", async () => {
    const product = await createProduct({ productId });

    const { user: user1 } = await createUserWithShift({
      group: "a",
      tag,
    });

    const { user: user2 } = await createUserWithShift({
      group: "b",
      tag,
    });

    await ProductServiceUpdate(product?._id, {
      users: [
        { userId: user1._id, tag },
        { userId: user2._id, tag },
      ],
    });

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

  it("User: Should be able to get any product that include users that belongs to same group", async () => {
    const { token } = await login(AuthRole.user);

    const { user: user1 } = await createUserWithShift({
      group: DEFAULT_GROUP,
      tag,
    });

    const product = await createProduct({ productId });

    await ProductServiceUpdate(product?._id, {
      users: [{ userId: user1._id, tag }],
    });

    request = await createHttpRequest<ProductControllerGetByIdRequest>({
      query: {
        id: product._id,
      },
      token,
    });

    const res: HttpSuccessResponse<ProductControllerGetByIdResponse> =
      await ProductControllerGetById(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.productId).toBe(product.productId);
  });

  it("User: Should NOT be able to get product that he doesn't belongs to or his group.", async () => {
    const { token } = await login(AuthRole.user);

    const { user: user1 } = await createUserWithShift({
      group: "a",
      tag,
    });

    const product = await createProduct({ productId });

    await ProductServiceUpdate(product?._id, {
      users: [{ userId: user1._id, tag }],
    });

    request = await createHttpRequest<ProductControllerGetByIdRequest>({
      query: {
        id: product._id,
      },
      token,
    });

    const res: HttpErrorResponse = await ProductControllerGetById(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
  });

  it("Admin: Should be able to get any product that include users that belongs to same group", async () => {
    const { token } = await login(AuthRole.user);

    const { user: user1 } = await createUserWithShift({
      group: DEFAULT_GROUP,
      tag,
    });

    const product = await createProduct({ productId });

    await ProductServiceUpdate(product?._id, {
      users: [{ userId: user1._id, tag }],
    });

    request = await createHttpRequest<ProductControllerGetByIdRequest>({
      query: {
        id: product._id,
      },
      token,
    });

    const res: HttpSuccessResponse<ProductControllerGetByIdResponse> =
      await ProductControllerGetById(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.productId).toBe(product.productId);
  });

  it("Admin: Should not be able to get product that no co-worker/user belongs to same group", async () => {
    const { token } = await login(AuthRole.admin);

    const { user: user1 } = await createUserWithShift({
      group: "a",
      tag,
    });

    const product = await createProduct({ productId });

    await ProductServiceUpdate(product?._id, {
      users: [{ userId: user1._id, tag }],
    });

    request = await createHttpRequest<ProductControllerGetByIdRequest>({
      query: {
        id: product._id,
      },
      token,
    });

    const res: HttpErrorResponse = await ProductControllerGetById(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
  });
});
