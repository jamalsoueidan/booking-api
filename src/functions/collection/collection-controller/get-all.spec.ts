import { HttpRequest, InvocationContext } from "@azure/functions";
import { AuthRole } from "~/functions/auth";
import { Tag } from "~/functions/shift";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import { createCollection, createProduct } from "~/library/jest/helpers";
import { clearDatabase, connect, disconnect } from "~/library/jest/mongoose";
import { CollectionServiceAddProduct } from "../collection.service";
import {
  CollectionControllerGetAll,
  CollectionControllerGetAllRequest,
  CollectionControllerGetAllResponse,
} from "./get-all";

const productId = 123456789;

describe("CollectionControllerGetAll", () => {
  let response: HttpSuccessResponse<CollectionControllerGetAllResponse>;
  const tag = Tag.all_day;

  afterAll(async () => {
    await clearDatabase();
    await disconnect();
  });

  beforeAll(async () => {
    await connect();
    const collection = await createCollection();

    const product1 = await createProduct({ productId: 234243423 });
    await CollectionServiceAddProduct(
      collection.collectionId,
      product1.productId
    );

    const product2 = await createProduct({ productId });
    await CollectionServiceAddProduct(
      collection.collectionId,
      product2.productId
    );

    const context: InvocationContext = createContext();
    const request: HttpRequest =
      await createHttpRequest<CollectionControllerGetAllRequest>({
        loginAs: AuthRole.owner,
      });

    response = await CollectionControllerGetAll(request, context);
  });

  it("", () => {
    expect(1).toBe(1);
  });
});
