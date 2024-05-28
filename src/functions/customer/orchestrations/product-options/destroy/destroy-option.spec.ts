import { shopifyAdmin } from "~/library/shopify";
import { ProductOptionDestroyMutation } from "~/types/admin.generated";
import { destroyProductOption, PRODUCT_OPTION_DESTROY } from "./destroy-option";

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

describe("CustomerProductOptionsDestroyOrchestration", () => {
  beforeAll(async () => {
    jest.clearAllMocks();
  });

  it("destroyProductOption", async () => {
    mockRequest.mockResolvedValueOnce({
      data: productDelete,
    });

    await destroyProductOption({
      productOptionId: 123,
    });

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(mockRequest).toHaveBeenNthCalledWith(1, PRODUCT_OPTION_DESTROY, {
      variables: {
        productId: `gid://shopify/Product/123`,
      },
    });
  });
});
