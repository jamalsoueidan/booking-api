import mongoose from "mongoose";
import { LocationOriginTypes, LocationTypes } from "~/functions/location";
import { ScheduleProduct } from "~/functions/schedule";
import { createUser } from "~/library/jest/helpers";
import { shopifyAdmin } from "~/library/shopify";
import {
  ProductDuplicateMutation,
  ProductPricepdateMutation,
  ProductUpdateMutation,
} from "~/types/admin.generated";
import { CustomerScheduleServiceCreate } from "../schedule/create";
import { GidFormat } from "./../../../../library/zod/index";
import { CustomerProductServiceAdd, PRODUCT_DUPLCATE } from "./add";
import { PRODUCT_PRICE_UPDATE, PRODUCT_UPDATE } from "./update";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("@shopify/admin-api-client", () => ({
  createAdminApiClient: () => ({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin.request as jest.Mock;

describe("CustomerProductServiceAdd", () => {
  let mockProduct: ProductDuplicateMutation;
  let productBody: Pick<
    ScheduleProduct,
    "parentId" | "locations" | "price" | "compareAtPrice"
  >;
  let title: string = "title product";

  beforeEach(() => {
    // Clear all mocks before each test
    (shopifyAdmin.request as jest.Mock).mockClear();

    productBody = {
      parentId: 8022089105682,
      locations: [
        {
          location: new mongoose.Types.ObjectId(),
          locationType: LocationTypes.DESTINATION,
          originType: LocationOriginTypes.COMMERCIAL,
        },
      ],
      price: {
        amount: "100",
        currencyCode: "DKK",
      },
      compareAtPrice: {
        amount: "150",
        currencyCode: "DKK",
      },
    };

    mockProduct = {
      productDuplicate: {
        newProduct: {
          id: "gid://shopify/Product/1",
          handle: "testerne-new-product",
          tags: [],
          variants: {
            nodes: [
              {
                id: "gid://shopify/ProductVariant/49511289782599",
                compareAtPrice: "0.00",
                price: "0.00",
              },
            ],
          },
          parentId: {
            id: `gid://shopify/Metafield/44429081510215`,
            value: `gid://shopify/Product/${productBody.parentId}`,
          },
          scheduleId: {
            id: "gid://shopify/Metafield/44429081542983",
            value: "",
          },
          locations: {
            id: "gid://shopify/Metafield/44429081411911",
            value: "{}",
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
  });

  it("should add a new product to the schedule", async () => {
    const customerId = 123;
    const user = await createUser({ customerId });

    const newSchedule = await CustomerScheduleServiceCreate({
      name: "Test Schedule",
      customerId,
    });

    const tags = [
      `user`,
      `user-${user.username}`,
      `userid-${user.customerId}`,
      `treatments`,
      `productid-${GidFormat.parse(
        mockProduct.productDuplicate?.newProduct?.id
      )}`,
      `product-${mockProduct.productDuplicate?.newProduct?.handle}`,
      `scheduleid-${newSchedule._id}`,
      `locationid-${productBody.locations[0].location}`,
    ];

    const mockProductUpdate: ProductUpdateMutation = {
      productUpdate: {
        product: {
          id: `gid://shopify/Product/${GidFormat.parse(
            mockProduct.productDuplicate?.newProduct?.id
          )}}`,
          handle: "testerne-new-product",
          variants: {
            nodes: mockProduct.productDuplicate?.newProduct?.variants.nodes!,
          },
          tags,
          parentId: {
            id: mockProduct.productDuplicate?.newProduct?.parentId?.id!,
            value: `gid://shopify/Product/${productBody.parentId}`,
          },
          scheduleId: {
            id: mockProduct.productDuplicate?.newProduct?.scheduleId?.id!,
            value: "schedule",
          },
          locations: {
            id: mockProduct.productDuplicate?.newProduct?.locations?.id!,
            value: '{"locations":[]}',
          },
          bookingPeriodValue: {
            id: mockProduct.productDuplicate?.newProduct?.bookingPeriodValue
              ?.id!,
            value: "1",
          },
          bookingPeriodUnit: {
            id: mockProduct.productDuplicate?.newProduct?.bookingPeriodUnit
              ?.id!,
            value: "months",
          },
          noticePeriodValue: {
            id: mockProduct.productDuplicate?.newProduct?.noticePeriodValue
              ?.id!,
            value: "1",
          },
          noticePeriodUnit: {
            id: mockProduct.productDuplicate?.newProduct?.noticePeriodUnit?.id!,
            value: "hours",
          },
          duration: {
            id: mockProduct.productDuplicate?.newProduct?.duration?.id!,
            value: "60",
          },
          breaktime: {
            id: mockProduct.productDuplicate?.newProduct?.breaktime?.id!,
            value: "10",
          },
        },
      },
    };

    const mockProductPriceUpdate: ProductPricepdateMutation = {
      productVariantsBulkUpdate: {
        product: {
          id: `gid://shopify/Product/${GidFormat.parse(
            mockProduct.productDuplicate?.newProduct?.id
          )}}`,
          variants: {
            nodes: [
              {
                id: mockProduct.productDuplicate?.newProduct?.variants.nodes[0]
                  .id!,
                compareAtPrice: productBody.compareAtPrice.amount,
                price: productBody.price.amount,
              },
            ],
          },
        },
      },
    };

    mockRequest
      .mockResolvedValueOnce({
        data: mockProduct,
      })
      .mockResolvedValueOnce({
        data: mockProductUpdate,
      })
      .mockResolvedValueOnce({
        data: mockProductPriceUpdate,
      });

    const updateProduct = await CustomerProductServiceAdd(
      {
        customerId: newSchedule.customerId,
      },
      { ...productBody, scheduleId: newSchedule._id, title }
    );

    expect(shopifyAdmin.request).toHaveBeenCalledTimes(3);

    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(1, PRODUCT_DUPLCATE, {
      variables: {
        productId: `gid://shopify/Product/${productBody.parentId}`,
        title,
      },
    });

    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(2, PRODUCT_UPDATE, {
      variables: {
        id: mockProduct.productDuplicate?.newProduct?.id,
        metafields: [
          {
            id: mockProductUpdate.productUpdate?.product?.breaktime?.id,
            value: mockProductUpdate.productUpdate?.product?.breaktime?.value,
          },
          {
            id: mockProductUpdate.productUpdate?.product?.duration?.id,
            value: mockProductUpdate.productUpdate?.product?.duration?.value,
          },
          {
            id: mockProductUpdate.productUpdate?.product?.bookingPeriodValue
              ?.id,
            value: "3",
          },
          {
            id: mockProductUpdate.productUpdate?.product?.bookingPeriodUnit?.id,
            value:
              mockProductUpdate.productUpdate?.product?.bookingPeriodUnit
                ?.value,
          },
          {
            id: mockProductUpdate.productUpdate?.product?.noticePeriodValue?.id,
            value:
              mockProductUpdate.productUpdate?.product?.noticePeriodValue
                ?.value,
          },
          {
            id: mockProductUpdate.productUpdate?.product?.noticePeriodUnit?.id,
            value:
              mockProductUpdate.productUpdate?.product?.noticePeriodUnit?.value,
          },
          {
            id: mockProductUpdate.productUpdate?.product?.locations?.id,
            value: JSON.stringify(productBody.locations),
          },
          {
            id: mockProductUpdate.productUpdate?.product?.scheduleId?.id,
            value: newSchedule._id.toString(),
          },
        ],
        tags: tags.join(", "),
      },
    });

    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(
      3,
      PRODUCT_PRICE_UPDATE,
      {
        variables: {
          id: mockProduct.productDuplicate?.newProduct?.id,
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

    expect(updateProduct).toMatchObject({
      parentId: productBody.parentId,
      productId: GidFormat.parse(mockProduct.productDuplicate?.newProduct?.id),
      scheduleId: newSchedule._id.toString(),
      variantId: GidFormat.parse(
        mockProduct.productDuplicate?.newProduct?.variants.nodes[0].id
      ),
    });
  });
});
