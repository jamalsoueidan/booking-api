import { getProductObject } from "~/library/jest/helpers/product";
import { shopifyAdmin } from "~/library/shopify";
import { CustomerProductServiceAdd } from "../product/add";
import { CustomerScheduleServiceCreate } from "../schedule/create";
import {
  CustomerProductOptionsAddService,
  PRODUCT_OPTION_ADD_TAG,
  PRODUCT_OPTION_DUPLCATE,
} from "./add";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("@shopify/admin-api-client", () => ({
  createAdminApiClient: () => ({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin.request as jest.Mock;

describe("CustomerProductOptionsAddService", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    (shopifyAdmin.request as jest.Mock).mockClear();
  });

  it("should duplicate a product and add tags correctly", async () => {
    const customerId = 123;

    const newSchedule = await CustomerScheduleServiceCreate({
      name: "Test Schedule",
      customerId,
    });

    const product = await CustomerProductServiceAdd(
      {
        customerId: newSchedule.customerId,
      },
      {
        ...getProductObject({}),
        scheduleId: newSchedule._id,
      }
    );

    const mockProduct = {
      productId: "gid://shopify/Product/9186772386119",
      title: "New Product Title",
      variants: {
        nodes: [
          {
            id: "gid://shopify/ProductVariant/49475617128775",
            title: "Tyk",
          },
          {
            id: "gid://shopify/ProductVariant/49475617259847",
            title: "Normal",
          },
          {
            id: "gid://shopify/ProductVariant/49475617358151",
            title: "Meget tyk",
          },
        ],
      },
    };

    // Setup mock responses
    (shopifyAdmin.request as jest.Mock)
      .mockResolvedValueOnce({
        data: { productDuplicate: { newProduct: mockProduct } },
      })
      .mockResolvedValueOnce({
        data: { tagsAdd: { node: { id: mockProduct.productId } } },
      });

    const result = await CustomerProductOptionsAddService({
      customerId,
      parentId: product.productId,
      productId: 123123,
      title: "New Product",
    });

    expect(result).toEqual(mockProduct);
    expect(shopifyAdmin.request).toHaveBeenCalledTimes(2);
    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(
      1,
      PRODUCT_OPTION_DUPLCATE,
      {
        variables: {
          id: `gid://shopify/Product/123123`,
          title: "New Product",
        },
      }
    );
    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(
      2,
      PRODUCT_OPTION_ADD_TAG,
      {
        variables: {
          id: `gid://shopify/Product/123123`,
          tags: "123, parent-id, user",
        },
      }
    );
  });
});
