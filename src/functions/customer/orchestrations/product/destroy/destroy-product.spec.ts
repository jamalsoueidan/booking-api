import { shopifyAdmin } from "~/library/shopify";
import { ProductOptionDestroyMutation } from "~/types/admin.generated";
import { destroyProduct, PRODUCT_DESTROY } from "./destroy-product";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/library/shopify", () => ({
  shopifyAdmin: jest.fn().mockReturnValue({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin().request as jest.Mock;

const productDelete: ProductOptionDestroyMutation = {
  productDelete: {
    deletedProductId: `gid://shopify/Product/123`,
  },
};

describe("CustomerProductDestroyOrchestration", () => {
  beforeAll(async () => {
    jest.clearAllMocks();
  });

  it("destroyProduct", async () => {
    mockRequest.mockResolvedValueOnce({
      data: {
        productDelete: {
          deletedProductId: {
            id: "123",
          },
        },
      },
    });

    await destroyProduct({
      productId: 123,
    });

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(mockRequest).toHaveBeenNthCalledWith(1, PRODUCT_DESTROY, {
      variables: {
        productId: `gid://shopify/Product/123`,
      },
    });
  });
});
