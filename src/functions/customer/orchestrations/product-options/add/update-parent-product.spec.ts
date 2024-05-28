import { createUser } from "~/library/jest/helpers";
import { getProductObject } from "~/library/jest/helpers/product";
import { createScheduleWithProducts } from "~/library/jest/helpers/schedule";
import { shopifyAdmin } from "~/library/shopify";
import { ProductParentUpdateMutation } from "~/types/admin.generated";
import {
  PRODUCT_PARENT_UPDATE,
  updateParentProduct,
} from "./update-parent-product";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/library/shopify", () => ({
  shopifyAdmin: jest.fn().mockReturnValue({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin().request as jest.Mock;

const mockProductParentUpdate: ProductParentUpdateMutation = {
  productUpdate: {
    product: {
      options: {
        id: "gid://shopify/Metafield/44505109102919",
      },
    },
  },
};

describe("CustomerProductOptionsAddOrchestration", () => {
  beforeAll(async () => {
    jest.clearAllMocks();
  });

  it("updateParentProduct", async () => {
    const customerId = 123;

    const user = await createUser({ customerId });

    const product = { ...getProductObject({}) };

    const newSchedule = await createScheduleWithProducts({
      name: "Test Schedule",
      customerId,
      products: [product],
    });

    mockRequest.mockResolvedValueOnce({
      data: mockProductParentUpdate,
    });

    await updateParentProduct({
      customerId,
      productId: product.productId,
    });

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(mockRequest).toHaveBeenNthCalledWith(1, PRODUCT_PARENT_UPDATE, {
      variables: {
        id: `gid://shopify/Product/${product.productId}`,
        metafields: [
          {
            key: "options",
            namespace: "booking",
            value: JSON.stringify([]),
          },
        ],
      },
    });
  });
});
