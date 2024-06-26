import { ScheduleModel } from "~/functions/schedule";
import { getProductObject } from "~/library/jest/helpers/product";
import { createScheduleWithProducts } from "~/library/jest/helpers/schedule";
import { shopifyAdmin } from "~/library/shopify";
import { GidFormat } from "~/library/zod";
import { ProductOptionUpdateMutation } from "~/types/admin.generated";
import {
  CustomerProductOptionsServiceUpdate,
  PRODUCT_OPTION_UPDATE,
} from "./update";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/library/shopify", () => ({
  shopifyAdmin: jest.fn().mockReturnValue({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin().request as jest.Mock;

describe("CustomerProductOptionsAddService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be able to add 1 or more options to a product", async () => {
    const customerId = 123;
    const productId = 123123;
    const optionProductId = 323232;

    const product = getProductObject({
      productId,
      options: [
        {
          productId: optionProductId,
          title: "new",
          required: true,
          variants: [
            {
              variantId: 1,
              title: "a",
              price: 1,
              duration: {
                metafieldId: 11,
                value: 60,
              },
            },
            {
              variantId: 2,
              title: "b",
              price: 2,
              duration: {
                metafieldId: 22,
                value: 30,
              },
            },
            {
              variantId: 3,
              title: "c",
              price: 2,
              duration: {
                metafieldId: 33,
                value: 15,
              },
            },
          ],
        },
      ],
    });

    const newSchedule = await createScheduleWithProducts({
      name: "Test Schedule",
      customerId,
      products: [product],
    });

    const newDurationPrice = 1;
    const newDurationValue = 120;

    const mockProduct: ProductOptionUpdateMutation = {
      productVariantsBulkUpdate: {
        product: {
          id: `gid://shopify/Product/${optionProductId}`,
          title: "Product",
          variants: {
            nodes: [
              {
                id: "gid://shopify/ProductVariant/1",
                title: "Variant 1",
                price: "12.00",
                duration: {
                  id: "gid://shopify/Metafield/11",
                  value: "60",
                },
              },
              {
                id: "gid://shopify/ProductVariant/2",
                title: "Variant 2",
                price: "50.00",
                duration: {
                  id: "gid://shopify/Metafield/22",
                  value: "30",
                },
              },
              {
                id: "gid://shopify/ProductVariant/3",
                title: "Variant 3",
                price: newDurationPrice.toString(),
                duration: {
                  id: "gid://shopify/Metafield/33",
                  value: newDurationValue.toString(),
                },
              },
            ],
          },
        },
      },
    };

    mockRequest.mockResolvedValueOnce({ data: mockProduct });

    let result = await CustomerProductOptionsServiceUpdate(
      {
        customerId,
        productId: product.productId,
        optionProductId,
      },
      {
        variants: [
          {
            id: 3,
            duration: newDurationValue,
            price: newDurationPrice,
          },
        ],
      }
    );

    //expect(result).toHaveLength(1);
    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(mockRequest).toHaveBeenNthCalledWith(1, PRODUCT_OPTION_UPDATE, {
      variables: {
        productId: `gid://shopify/Product/${optionProductId}`,
        variants: [
          {
            id: `gid://shopify/ProductVariant/3`,
            price: newDurationPrice.toString(),
            metafields: [
              {
                id: `gid://shopify/Metafield/33`,
                value: newDurationValue.toString(),
                type: "number_integer",
              },
            ],
          },
        ],
      },
    });

    let schedule = await ScheduleModel.findOne(newSchedule._id).orFail();
    expect(schedule).not.toBeNull();
    expect(schedule.products).toHaveLength(1);
    let scheduleProduct = schedule.products[0];
    expect(scheduleProduct.options).toHaveLength(1);
    let options = scheduleProduct?.options![0];
    expect(options.productId).toEqual(
      GidFormat.parse(mockProduct.productVariantsBulkUpdate?.product?.id)
    );
    expect(options.variants).toHaveLength(3);
    const variant = options.variants[2];
    expect(variant).toMatchObject({
      duration: { metafieldId: 33, value: 120 },
      variantId: 3,
    });
  });
});
