import { TimeUnit } from "~/functions/schedule";
import { createUser } from "~/library/jest/helpers";
import { getProductObject } from "~/library/jest/helpers/product";
import { createScheduleWithProducts } from "~/library/jest/helpers/schedule";
import { shopifyAdmin } from "~/library/shopify";
import { BooleanOrString, GidFormat } from "~/library/zod";
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

describe("CustomerProductServiceUpdate", () => {
  const customerId = 123;
  const name = "Test Schedule";

  const productBody: CustomerProductServiceUpdateBody = {
    duration: 90,
    price: {
      amount: "99.00",
    },
    compareAtPrice: {
      amount: "199.0",
    },
  };

  const mockProductUpdate: ProductUpdateMutation = {
    productUpdate: {
      product: {
        id: "gid://shopify/Product/9196220121415",
        handle: "test-product-1",
        title: "asd",
        tags: [""],
        variants: {
          nodes: [
            {
              id: "gid://shopify/ProductVariant/1",
              compareAtPrice: productBody.compareAtPrice?.amount,
              price: productBody.price?.amount,
            },
          ],
        },
        active: {
          id: `gid://shopify/Metafield/3333`,
          value: `False`,
        },
        user: {
          id: `gid://shopify/Metafield/44429081510215`,
          value: `gid://shopify/Metafield/123312`,
        },
        hideFromProfile: {
          id: `gid://shopify/Metafield/44429081510215`,
          value: "false",
        },
        hideFromCombine: {
          id: `gid://shopify/Metafield/233`,
          value: "false",
        },
        parentId: {
          id: "gid://shopify/Metafield/1",
          value: "gid://shopify/Product/123",
        },
        scheduleId: {
          id: "gid://shopify/Metafield/2",
          value: "schedule",
        },
        locations: {
          id: "gid://shopify/Metafield/3",
          value: '{"locations":[]}',
        },
        bookingPeriodValue: {
          id: "gid://shopify/Metafield/4",
          value: "1",
        },
        bookingPeriodUnit: {
          id: "gid://shopify/Metafield/5",
          value: "months",
        },
        noticePeriodValue: {
          id: "gid://shopify/Metafield/6",
          value: "1",
        },
        noticePeriodUnit: {
          id: "gid://shopify/Metafield/7",
          value: "hours",
        },
        duration: {
          id: "gid://shopify/Metafield/8",
          value: productBody.duration!.toString(),
        },
        breaktime: {
          id: "gid://shopify/Metafield/9",
          value: "10",
        },
      },
    },
  };

  const mockProductPriceUpdate: ProductPricepdateMutation = {
    productVariantsBulkUpdate: {
      product: {
        id: mockProductUpdate.productUpdate?.product?.id!,
        variants: {
          nodes: [
            {
              id: mockProductUpdate.productUpdate?.product?.variants.nodes[0]
                .id!,
              compareAtPrice: productBody.compareAtPrice?.amount,
              price: productBody.price?.amount,
            },
          ],
        },
      },
    },
  };

  it("should update an existing product in the schedule", async () => {
    const user = await createUser({ customerId });

    const newSchedule = await createScheduleWithProducts({
      name,
      customerId,
      metafieldId: "gid://shopify/Metafield/533232",
      products: [
        getProductObject({
          parentId: GidFormat.parse(
            mockProductUpdate.productUpdate?.product?.parentId?.value
          ),
          description: "test test",
          descriptionHtml: "<p>test test</p>",
          user: {
            metaobjectId: mockProductUpdate.productUpdate?.product?.user?.id,
            value: mockProductUpdate.productUpdate?.product?.user?.value,
          },
          activeMetafieldId:
            mockProductUpdate.productUpdate?.product?.active?.id,
          active: BooleanOrString.parse(
            mockProductUpdate.productUpdate?.product?.active?.value
          ),
          hideFromProfileMetafieldId:
            mockProductUpdate.productUpdate?.product?.hideFromProfile?.id,
          hideFromProfile: false,
          hideFromCombineMetafieldId:
            mockProductUpdate.productUpdate?.product?.hideFromCombine?.id,
          hideFromCombine: false,
          productId: GidFormat.parse(
            mockProductUpdate.productUpdate?.product?.id
          ),
          scheduleIdMetafieldId:
            mockProductUpdate.productUpdate?.product?.scheduleId?.id,
          variantId: GidFormat.parse(
            mockProductUpdate.productUpdate?.product?.variants.nodes[0].id
          ),
          durationMetafieldId:
            mockProductUpdate.productUpdate?.product?.duration?.id,
          duration: 120,
          breakTimeMetafieldId:
            mockProductUpdate.productUpdate?.product?.breaktime?.id,
          breakTime: 0,
          noticePeriod: {
            valueMetafieldId:
              mockProductUpdate.productUpdate?.product?.noticePeriodValue?.id,
            unitMetafieldId:
              mockProductUpdate.productUpdate?.product?.noticePeriodUnit?.id,
            value: 1,
            unit: TimeUnit.DAYS,
          },
          bookingPeriod: {
            valueMetafieldId:
              mockProductUpdate.productUpdate?.product?.bookingPeriodValue?.id,
            unitMetafieldId:
              mockProductUpdate.productUpdate?.product?.bookingPeriodUnit?.id,
            value: 1,
            unit: TimeUnit.WEEKS,
          },
        }),
      ],
    });

    const product = newSchedule.products[0];

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
        productId: GidFormat.parse(
          mockProductUpdate.productUpdate?.product?.id
        ),
      },
      productBody
    );

    const tags = [
      `user`,
      `user-${user.username}`,
      `userid-${user.customerId}`,
      `treatments`,
      `parentid-${updateProduct.parentId}`,
      `productid-${GidFormat.parse(
        mockProductUpdate.productUpdate?.product?.id
      )}`,
      `product-${product.productHandle}`,
      `scheduleid-${newSchedule._id}`,
      `locationid-${product.locations[0].location}`,
    ];

    expect(shopifyAdmin.request).toHaveBeenCalledTimes(2);
    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(1, PRODUCT_UPDATE, {
      variables: {
        id: mockProductUpdate.productUpdate?.product?.id,
        title: updateProduct.title,
        descriptionHtml: updateProduct.descriptionHtml,
        metafields: [
          {
            id: mockProductUpdate.productUpdate?.product?.duration?.id,
            value: String(productBody.duration),
          },
          {
            id: mockProductUpdate.productUpdate?.product?.user?.id,
            value: user.userMetaobjectId,
          },
          {
            id: mockProductUpdate.productUpdate?.product?.active?.id,
            value: user.active.toString(),
          },
          {
            id: mockProductUpdate.productUpdate?.product?.scheduleId?.id,
            value: newSchedule.metafieldId,
          },
        ],
        tags: tags.join(", "),
      },
    });
    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(
      2,
      PRODUCT_PRICE_UPDATE,
      {
        variables: {
          id: mockProductUpdate.productUpdate?.product?.id,
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
      productId: GidFormat.parse(mockProductUpdate.productUpdate?.product?.id),
    });

    expect(getUpdatedProduct.productId).toEqual(updateProduct.productId);
  });
});
