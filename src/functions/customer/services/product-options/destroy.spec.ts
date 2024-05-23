import { ScheduleModel } from "~/functions/schedule";
import { getProductObject } from "~/library/jest/helpers/product";
import { createScheduleWithProducts } from "~/library/jest/helpers/schedule";
import { shopifyAdmin } from "~/library/shopify";
import {
  ProductDestroyMetafieldMutation,
  ProductOptionDestroyMutation,
} from "~/types/admin.generated";
import {
  CustomerProductOptionsServiceDestroy,
  PRODUCT_DESTROY_METAFIELD,
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

  it("should be able to destroy product option", async () => {
    const productId = 321;
    const optionProductId = 123;
    const customerId = 123123;
    const mockProduct = {
      id: "123",
    };

    const productDelete: ProductOptionDestroyMutation = {
      productDelete: { deletedProductId: mockProduct.id },
    };

    const metafieldDelete: ProductDestroyMetafieldMutation = {
      metafieldDelete: {
        deletedId: "gid://shopify/Metafield/44505109102919",
      },
    };

    const product = {
      ...getProductObject({
        productId: productId,
        optionsMetafieldId: metafieldDelete.metafieldDelete?.deletedId!,
        options: [
          {
            productId: optionProductId,
            title: "asd",
            variants: [],
            required: true,
          },
        ],
      }),
    };

    const newSchedule = await createScheduleWithProducts({
      name: "Test Schedule",
      customerId,
      products: [product],
    });

    // Setup mock responses
    mockRequest
      .mockResolvedValueOnce({
        data: productDelete,
      })
      .mockResolvedValueOnce({
        data: metafieldDelete,
      });

    const result = await CustomerProductOptionsServiceDestroy({
      customerId,
      productId,
      optionProductId,
    });

    expect(result).toHaveLength(0);

    expect(shopifyAdmin.request).toHaveBeenCalledTimes(2);
    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(
      1,
      PRODUCT_OPTION_DESTROY,
      {
        variables: {
          productId: `gid://shopify/Product/${optionProductId}`,
        },
      }
    );
    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(
      2,
      PRODUCT_DESTROY_METAFIELD,
      {
        variables: {
          metafieldId: metafieldDelete.metafieldDelete?.deletedId,
        },
      }
    );

    let schedule = await ScheduleModel.findOne(newSchedule._id).orFail();
    expect(schedule.products).toHaveLength(1);
    let scheduleProduct = schedule.products[0];
    expect(scheduleProduct.options).toHaveLength(0);
    expect(scheduleProduct.optionsMetafieldId).toBe(null);
  });
});
