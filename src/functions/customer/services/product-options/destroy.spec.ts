import { shopifyAdmin } from "~/library/shopify";
import {
  CustomerProductOptionsDestroyService,
  PRODUCT_OPTION_DESTROY,
} from "./destroy";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("@shopify/admin-api-client", () => ({
  createAdminApiClient: () => ({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin.request as jest.Mock;

describe("CustomerProductOptionsDestroyService", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    (shopifyAdmin.request as jest.Mock).mockClear();
  });

  it("should destroy product", async () => {
    const mockProduct = {
      done: true,
      id: "123",
    };

    // Setup mock responses
    (shopifyAdmin.request as jest.Mock).mockResolvedValueOnce({
      data: { productDeleteAsync: { job: mockProduct } },
    });

    const result = await CustomerProductOptionsDestroyService({
      customerId: 123,
      productId: "product-id",
    });

    expect(result).toEqual(mockProduct);
    expect(shopifyAdmin.request).toHaveBeenCalledTimes(1);
    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(
      1,
      PRODUCT_OPTION_DESTROY,
      {
        variables: {
          id: `gid://shopify/Product/product-id`,
        },
      }
    );
  });
});
