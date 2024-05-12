import { HttpRequest, InvocationContext } from "@azure/functions";

import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import mongoose from "mongoose";
import { LocationOriginTypes, LocationTypes } from "~/functions/location";
import { ScheduleProduct } from "~/functions/schedule";
import { createUser } from "~/library/jest/helpers";
import { getProductObject } from "~/library/jest/helpers/product";
import { shopifyAdmin } from "~/library/shopify";
import { GidFormat } from "~/library/zod";
import {
  ProductDuplicateMutation,
  ProductPricepdateMutation,
  ProductUpdateMutation,
} from "~/types/admin.generated";
import { CustomerScheduleServiceCreate } from "../../services/schedule/create";
import {
  CustomerProductControllerAdd,
  CustomerProductControllerAddRequest,
  CustomerProductControllerAddResponse,
} from "./add";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("@shopify/admin-api-client", () => ({
  createAdminApiClient: () => ({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin.request as jest.Mock;

describe("CustomerProductControllerAdd", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  const customerId = 123;
  const productId = 1000;
  let mockProduct: ProductDuplicateMutation;
  let productBody: Pick<
    ScheduleProduct,
    "parentId" | "locations" | "price" | "compareAtPrice"
  >;
  let title: string = "title product";

  beforeEach(async () => {
    context = createContext();
    jest.clearAllMocks();

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
          hasOptions: {
            id: "gid://shopify/Metafield/44429081423",
            value: "false",
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

  it("should be able to add slots schedule", async () => {
    const user = await createUser({ customerId });

    const newSchedule = await CustomerScheduleServiceCreate({
      name: "asd",
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
          variants: {
            nodes: mockProduct.productDuplicate?.newProduct?.variants.nodes!,
          },
          handle: "testerne-new-product",
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

    const body = getProductObject({ productId });
    request = await createHttpRequest<CustomerProductControllerAddRequest>({
      query: {
        customerId,
      },
      body: { ...body, title: "new", scheduleId: newSchedule._id },
    });

    const res: HttpSuccessResponse<CustomerProductControllerAddResponse> =
      await CustomerProductControllerAdd(request, context);

    expect(res.jsonBody?.success).toBeTruthy();

    expect(res.jsonBody?.payload).toEqual(
      expect.objectContaining({
        productId: GidFormat.parse(
          mockProduct.productDuplicate?.newProduct?.id
        ),
      })
    );
  });
});
