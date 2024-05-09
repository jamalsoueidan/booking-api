import { TimeUnit } from "~/functions/schedule";
import { omitObjectIdProps } from "~/library/jest/helpers";
import { getProductObject } from "~/library/jest/helpers/product";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { shopifyAdmin } from "~/library/shopify";
import {
  ProductPricepdateMutation,
  ProductUpdateMutation,
} from "~/types/admin.generated";
import { CustomerProductServiceGet } from "./get";
import {
  CustomerProductServiceUpdate,
  CustomerProductServiceUpdateBody,
  PRODUCT_PRICE_UPDATE,
  PRODUCT_UPDATE,
} from "./update";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("@shopify/admin-api-client", () => ({
  createAdminApiClient: () => ({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin.request as jest.Mock;

const mockProductUpdate: ProductUpdateMutation = {
  productUpdate: {
    product: {
      id: "gid://shopify/Product/9196220121415",
      variants: {
        nodes: [
          {
            id: "gid://shopify/ProductVariant/49511289782599",
            compareAtPrice: "150.00",
            price: "90.00",
          },
        ],
      },
      parentId: {
        id: "gid://shopify/Metafield/44429081510215",
        value: "gid://shopify/Product/8022089105682",
      },
      scheduleId: {
        id: "gid://shopify/Metafield/44429081542983",
        value: "schedule",
      },
      locations: {
        id: "gid://shopify/Metafield/44429081411911",
        value: '{"locations":[]}',
      },
      bookingPeriodValue: {
        id: "gid://shopify/Metafield/44429081313607",
        value: "1",
      },
      bookingPeriodUnit: {
        id: "gid://shopify/Metafield/44429081280839",
        value: "months",
      },
      noticePeriodValue: {
        id: "gid://shopify/Metafield/44429081477447",
        value: "1",
      },
      noticePeriodUnit: {
        id: "gid://shopify/Metafield/44429081444679",
        value: "hours",
      },
      duration: {
        id: "gid://shopify/Metafield/44429081379143",
        value: "60",
      },
      breaktime: {
        id: "gid://shopify/Metafield/44429081346375",
        value: "10",
      },
    },
  },
};

const mockProductPriceUpdate: ProductPricepdateMutation = {
  productVariantsBulkUpdate: {
    product: {
      id: "gid://shopify/Product/9196220121415",
      variants: {
        nodes: [
          {
            id: "gid://shopify/ProductVariant/49503397249351",
            compareAtPrice: "150.00",
            price: "90.00",
          },
        ],
      },
    },
  },
};

describe("CustomerProductServiceUpdate", () => {
  const customerId = 123;
  const name = "Test Schedule";
  const productId = 1000;
  const newProduct = getProductObject({
    productId,
    variantId: 1,
    durationMetafieldId: mockProductUpdate.productUpdate?.product?.duration?.id,
    duration: parseInt(
      mockProductUpdate.productUpdate?.product?.duration?.value || ""
    ),
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

  it("should update an existing product in the schedule", async () => {
    const newSchedule = await createSchedule({
      name,
      customerId,
      products: [newProduct],
    });

    const productBody: CustomerProductServiceUpdateBody = {
      duration: 90,
      price: {
        amount: "99.00",
      },
      compareAtPrice: {
        amount: "99.0",
      },
    };

    mockRequest
      .mockResolvedValueOnce({
        data: mockProductUpdate,
      })
      .mockResolvedValueOnce({
        data: mockProductPriceUpdate,
      });

    let updateProduct = await CustomerProductServiceUpdate(
      {
        customerId: newSchedule.customerId,
        productId,
      },
      productBody
    );

    expect(shopifyAdmin.request).toHaveBeenCalledTimes(2);
    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(1, PRODUCT_UPDATE, {
      variables: {
        id: `gid://shopify/Product/${productId}`,
        metafields: [
          {
            id: mockProductUpdate.productUpdate?.product?.duration?.id,
            value: String(productBody.duration),
          },
        ],
      },
    });
    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(
      2,
      PRODUCT_PRICE_UPDATE,
      {
        variables: {
          productId: `gid://shopify/Product/${productId}`,
          variants: [
            {
              id: mockProductUpdate.productUpdate?.product?.variants.nodes[0]
                .id,
              price: productBody.price?.amount,
              compareAtPrice: productBody.compareAtPrice?.amount,
            },
          ],
        },
      }
    );

    const getUpdatedProduct = await CustomerProductServiceGet({
      customerId: newSchedule.customerId,
      productId,
    });

    expect(omitObjectIdProps(getUpdatedProduct)).toEqual(
      expect.objectContaining(
        omitObjectIdProps({
          ...productBody,
          productId: updateProduct.productId,
        })
      )
    );
  });
});
