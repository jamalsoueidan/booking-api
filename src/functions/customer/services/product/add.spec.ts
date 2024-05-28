import mongoose from "mongoose";
import { LocationOriginTypes, LocationTypes } from "~/functions/location";
import { ScheduleProduct } from "~/functions/schedule";
import { createUser } from "~/library/jest/helpers";
import {
  createLocation,
  getDumbLocationObject,
} from "~/library/jest/helpers/location";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { shopifyAdmin } from "~/library/shopify";
import { ProductDuplicateMutation } from "~/types/admin.generated";
import { GidFormat } from "./../../../../library/zod/index";
import { CustomerProductServiceAdd, PRODUCT_DUPLCATE } from "./add";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/library/shopify", () => ({
  shopifyAdmin: jest.fn().mockReturnValue({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin().request as jest.Mock;

describe("CustomerProductServiceAdd", () => {
  let mockProduct: ProductDuplicateMutation;
  let productBody: Pick<
    ScheduleProduct,
    | "parentId"
    | "locations"
    | "price"
    | "compareAtPrice"
    | "description"
    | "descriptionHtml"
    | "hideFromCombine"
    | "hideFromProfile"
  > = {
    description: "test test",
    descriptionHtml: "<p>test test</p>",
    hideFromCombine: false,
    hideFromProfile: true,
    parentId: 8022089105682,
    locations: [
      getDumbLocationObject({
        location: new mongoose.Types.ObjectId(),
        locationType: LocationTypes.DESTINATION,
        originType: LocationOriginTypes.COMMERCIAL,
      }),
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

  let title: string = "title product";

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    mockProduct = {
      productDuplicate: {
        newProduct: {
          id: "gid://shopify/Product/1",
          handle: "testerne-new-product",
          title,
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
          active: {
            id: `gid://shopify/Metafield/3333`,
            value: `False`,
          },
          user: {
            id: `gid://shopify/Metafield/22`,
            value: `gid://shopify/Metafield/111`,
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
            id: `gid://shopify/Metafield/44429081510215`,
            value: `gid://shopify/Product/${productBody.parentId}`,
          },
          scheduleId: {
            id: "gid://shopify/Metafield/44429081542983",
            value: "",
          },
          locations: {
            id: "gid://shopify/Metafield/44429081411911",
            value: "[]",
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
    const location = await createLocation({ customerId: user.customerId });
    productBody = {
      ...productBody,
      locations: [
        getDumbLocationObject({ ...location, location: location._id }),
      ],
    };

    const newSchedule = await createSchedule({
      name: "Test Schedule",
      customerId,
      metafieldId: "gid://shopify/Metafield/533232",
    });

    mockRequest.mockResolvedValueOnce({
      data: mockProduct,
    });

    const updateProduct = await CustomerProductServiceAdd(
      {
        customerId: newSchedule.customerId,
      },
      {
        ...productBody,
        scheduleId: newSchedule._id,
        title,
      }
    );

    expect(mockRequest).toHaveBeenCalledTimes(1);

    expect(mockRequest).toHaveBeenNthCalledWith(1, PRODUCT_DUPLCATE, {
      variables: {
        productId: `gid://shopify/Product/${productBody.parentId}`,
        title,
      },
    });

    expect(updateProduct).toMatchObject({
      parentId: productBody.parentId,
      productId: GidFormat.parse(mockProduct.productDuplicate?.newProduct?.id),
      variantId: GidFormat.parse(
        mockProduct.productDuplicate?.newProduct?.variants.nodes[0].id
      ),
      user: {
        metaobjectId: mockProduct.productDuplicate?.newProduct?.user?.id!,
        value: mockProduct.productDuplicate?.newProduct?.user?.value!,
      },
    });
  });
});
