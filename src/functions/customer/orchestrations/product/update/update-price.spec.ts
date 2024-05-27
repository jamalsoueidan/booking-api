import { TimeUnit } from "~/functions/schedule";
import {
  createLocation,
  getDumbLocationObject,
} from "~/library/jest/helpers/location";
import { getProductObject } from "~/library/jest/helpers/product";
import { createScheduleWithProducts } from "~/library/jest/helpers/schedule";
import { shopifyAdmin } from "~/library/shopify";
import { GidFormat } from "~/library/zod";
import { ProductPricepdateMutation } from "~/types/admin.generated";
import { PRODUCT_PRICE_UPDATE, updatePrice } from "./update-price";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("@shopify/admin-api-client", () => ({
  createAdminApiClient: () => ({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin.request as jest.Mock;

const mockProductPriceUpdate: ProductPricepdateMutation = {
  productVariantsBulkUpdate: {
    product: {
      id: "gid://shopify/Product/9196220121415",
      variants: {
        nodes: [
          {
            id: "gid://shopify/ProductVariant/1",
            compareAtPrice: "99.0",
            price: "50.00",
          },
        ],
      },
    },
  },
};

describe("CustomerProductUpdateOrchestration", () => {
  beforeAll(async () => {
    jest.clearAllMocks();
  });

  it("updatePrice", async () => {
    const customerId = 123;
    const name = "Test Schedule";

    const location = await createLocation({ customerId });

    const product = getProductObject({
      locations: [
        getDumbLocationObject({ ...location, location: location._id }),
      ],
      description: "test test",
      descriptionHtml: "<p>test test</p>",
      hideFromProfile: false,
      hideFromCombine: false,
      productId: GidFormat.parse(
        mockProductPriceUpdate.productVariantsBulkUpdate?.product?.id
      ),
      variantId: GidFormat.parse(
        mockProductPriceUpdate.productVariantsBulkUpdate?.product?.variants
          .nodes[0].id
      ),
      duration: 120,
      breakTime: 0,
      noticePeriod: {
        value: 1,
        unit: TimeUnit.DAYS,
      },
      bookingPeriod: {
        value: 1,
        unit: TimeUnit.WEEKS,
      },
    });

    await createScheduleWithProducts({
      name,
      customerId,
      metafieldId: "gid://shopify/Metafield/533232",
      products: [product],
    });

    mockRequest.mockResolvedValueOnce({
      data: mockProductPriceUpdate,
    });

    await updatePrice({
      customerId,
      productId: product.productId,
    });

    expect(shopifyAdmin.request).toHaveBeenCalledTimes(1);
    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(
      1,
      PRODUCT_PRICE_UPDATE,
      {
        variables: {
          id: mockProductPriceUpdate.productVariantsBulkUpdate?.product?.id,
          variants: [
            {
              id: mockProductPriceUpdate.productVariantsBulkUpdate?.product
                ?.variants.nodes[0].id,
              price: product.price?.amount,
              compareAtPrice: product.compareAtPrice?.amount,
            },
          ],
        },
      }
    );
  });
});
