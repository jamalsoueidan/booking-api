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
import {
  ProductServiceGetById,
  ProductServiceUpdate,
} from "../product.service";
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

    const { user: user1 } = await createUserWithShift({
      group: "a",
      tag,
    });

    const { user: user2 } = await createUserWithShift({
      group: "b",
      tag,
    });

    request = await createHttpRequest<ProductControllerUpdateRequest>({
      query: {
        id: product._id,
      },
      body: {
        users: [
          { userId: user1._id.toString(), tag },
          { userId: user2._id.toString(), tag },
        ],
      },
      loginAs: AuthRole.owner,
    });

    const res: HttpSuccessResponse<ProductControllerUpdateResponse> =
      await ProductControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload.users.length).toBe(2);
  });

  it("Owner: Should throw error when tag is invalid or user id is invalid", async () => {
    const product = await createProduct({ productId });

    const { user: user1 } = await createUserWithShift({
      group: "a",
      tag,
    });

    request = await createHttpRequest<ProductControllerUpdateRequest>({
      query: {
        id: product._id,
      },
      body: {
        users: [{ _id: user1._id, tag: "asd" } as any],
      },
      loginAs: AuthRole.owner,
    });

    const res: HttpErrorResponse = await ProductControllerUpdate(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
  });

  it("User: Should NOT be able to update product", async () => {
    const { token, user: loggedInUser } = await login(AuthRole.user);

    const { user: user1 } = await createUserWithShift({
      group: "a",
      tag,
    });

    const product = await createProduct({ productId });

    request = await createHttpRequest<ProductControllerUpdateRequest>({
      query: {
        id: product._id,
      },
      body: {
        users: [{ userId: user1._id, tag }],
      },
      token,
    });

    const res: HttpErrorResponse = await ProductControllerUpdate(
      request,
      context
    );

    expect(res.jsonBody?.success).toBeFalsy();
  });

  it("Admin: Should be able to update product", async () => {
    const { token } = await login(AuthRole.admin);

    let product = await createProduct({ productId });

    const { user: user1 } = await createUserWithShift({
      group: DEFAULT_GROUP,
      tag,
    });

    const { user: user2 } = await createUserWithShift({
      group: DEFAULT_GROUP,
      tag,
    });

    const { user: user3 } = await createUserWithShift({
      group: "othergroup",
      tag,
    });

    await ProductServiceUpdate(product?._id, {
      users: [
        { userId: user1._id, tag },
        { userId: user3._id, tag },
      ],
    });

    request = await createHttpRequest<ProductControllerUpdateRequest>({
      query: {
        id: product._id,
      },
      body: {
        users: [
          { userId: user1._id.toString(), tag },
          { userId: user2._id.toString(), tag },
        ],
      },
      token,
    });

    const res: HttpSuccessResponse<ProductControllerUpdateResponse> =
      await ProductControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload?.users.length).toBe(2);

    // make sure that rest of the users is not overwriten in other groups
    const getProductInternal = await ProductServiceGetById(product._id);
    expect(getProductInternal?.users.length).toBe(3);
  });
});
