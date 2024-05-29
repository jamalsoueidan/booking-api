import { faker } from "@faker-js/faker";
import { TimeUnit } from "~/functions/schedule";
import { createUser } from "~/library/jest/helpers";
import {
  createLocation,
  getDumbLocationObject,
} from "~/library/jest/helpers/location";
import { getProductObject } from "~/library/jest/helpers/product";
import { createScheduleWithProducts } from "~/library/jest/helpers/schedule";
import { shopifyAdmin } from "~/library/shopify";
import { BooleanOrString, GidFormat } from "~/library/zod";
import { ProductUpdateMutation } from "~/types/admin.generated";
import { PRODUCT_UPDATE, updateProduct } from "./update-product";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/library/shopify", () => ({
  shopifyAdmin: jest.fn().mockReturnValue({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin().request as jest.Mock;

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
            compareAtPrice: "199.0",
            price: "99.00",
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
        value: "90",
      },
      breaktime: {
        id: "gid://shopify/Metafield/9",
        value: "10",
      },
    },
  },
};

describe("CustomerProductUpdateOrchestration", () => {
  beforeAll(async () => {
    jest.clearAllMocks();
  });

  it("createCollection", async () => {
    const customerId = 123;
    const name = "Test Schedule";

    const user = await createUser({ customerId });
    const location = await createLocation({
      customerId: user.customerId,
      metafieldId: `gid://${faker.number.int({ min: 1, max: 5 })}`,
    });
    const product = getProductObject({
      locations: [
        getDumbLocationObject({
          ...location,
          location: location._id,
          metafieldId: location.metafieldId,
        }),
      ],
      parentId: GidFormat.parse(
        mockProductUpdate.productUpdate?.product?.parentId?.value
      ),
      description: "test test",
      descriptionHtml: "<p>test test</p>",
      user: {
        metaobjectId: mockProductUpdate.productUpdate?.product?.user?.id,
        value: mockProductUpdate.productUpdate?.product?.user?.value,
      },
      activeMetafieldId: mockProductUpdate.productUpdate?.product?.active?.id,
      active: BooleanOrString.parse(
        mockProductUpdate.productUpdate?.product?.active?.value
      ),
      hideFromProfileMetafieldId:
        mockProductUpdate.productUpdate?.product?.hideFromProfile?.id,
      hideFromProfile: false,
      hideFromCombineMetafieldId:
        mockProductUpdate.productUpdate?.product?.hideFromCombine?.id,
      hideFromCombine: false,
      productId: GidFormat.parse(mockProductUpdate.productUpdate?.product?.id),
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
    });

    const newSchedule = await createScheduleWithProducts({
      name,
      customerId,
      metafieldId: "gid://shopify/Metafield/533232",
      products: [product],
    });

    mockRequest.mockResolvedValueOnce({
      data: mockProductUpdate,
    });

    await updateProduct({
      customerId,
      productId: product.productId,
    });

    const tags = [
      `user`,
      `user-${user.username}`,
      `userid-${user.customerId}`,
      `treatments`,
      `parentid-${product.parentId}`,
      `productid-${GidFormat.parse(
        mockProductUpdate.productUpdate?.product?.id
      )}`,
      `product-${product.productHandle}`,
      `scheduleid-${newSchedule._id}`,
      `locationid-${product.locations[0].location}`,
      `city-${location.city.replace(/ /g, "-").toLowerCase()}`,
    ];

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(mockRequest).toHaveBeenNthCalledWith(1, PRODUCT_UPDATE, {
      variables: {
        id: mockProductUpdate.productUpdate?.product?.id,
        title: product.title,
        descriptionHtml: product.descriptionHtml,
        handle: product.productHandle,
        metafields: [
          {
            id: product?.hideFromProfileMetafieldId,
            value: String(product.hideFromProfile),
          },
          {
            id: product?.hideFromCombineMetafieldId,
            value: String(product.hideFromCombine),
          },
          {
            id: product?.breakTimeMetafieldId,
            value: String(product.breakTime),
          },
          {
            id: product?.durationMetafieldId,
            value: String(product.duration),
          },
          {
            id: product?.bookingPeriod.valueMetafieldId,
            value: String(product.bookingPeriod.value),
          },
          {
            id: product?.bookingPeriod.unitMetafieldId,
            value: String(product.bookingPeriod.unit),
          },
          {
            id: product?.noticePeriod.valueMetafieldId,
            value: String(product.noticePeriod?.value),
          },
          {
            id: product?.noticePeriod.unitMetafieldId,
            value: String(product.noticePeriod?.unit),
          },
          {
            id: product?.locationsMetafieldId,
            value: JSON.stringify(product.locations.map((p) => p.metafieldId)),
          },
          {
            id: product?.user?.metaobjectId,
            value: product.user?.value,
          },
          {
            id: product.activeMetafieldId,
            value: user.active.toString(),
          },
          {
            id: product?.scheduleIdMetafieldId,
            value: newSchedule.metafieldId,
          },
        ],
        tags: tags.join(", "),
      },
    });
  });
});
