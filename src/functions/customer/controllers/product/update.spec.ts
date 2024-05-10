import { HttpRequest, InvocationContext } from "@azure/functions";

import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import { TimeUnit } from "~/functions/schedule";
import { createUser } from "~/library/jest/helpers";
import { getProductObject } from "~/library/jest/helpers/product";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { shopifyAdmin } from "~/library/shopify";
import {
  ProductPricepdateMutation,
  ProductUpdateMutation,
} from "~/types/admin.generated";
import {
  CustomerProductControllerUpdate,
  CustomerProductControllerUpdateRequest,
  CustomerProductControllerUpdateResponse,
} from "./update";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("@shopify/admin-api-client", () => ({
  createAdminApiClient: () => ({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin.request as jest.Mock;

describe("CustomerProductControllerUpdate", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  const customerId = 123;
  const productId = 1000;

  beforeEach(async () => {
    context = createContext();
    jest.clearAllMocks();
  });

  it("should be able to update product inside schedule", async () => {
    const user = await createUser({ customerId });

    const product = getProductObject({ productId });
    const newSchedule = await createSchedule({
      name: "adsasd",
      customerId,
      products: [product],
    });

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
          tags: [
            `user`,
            `user-${user.username}`,
            `userid-${user.customerId}`,
            `treatments`,
            `productid-${product.productId}`,
            `product-${product.productHandle}`,
            `scheduleid-${newSchedule._id}`,
            `locationid-${product.locations[0].location}`,
          ],
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

    mockRequest
      .mockResolvedValueOnce({
        data: mockProductUpdate,
      })
      .mockResolvedValueOnce({
        data: mockProductPriceUpdate,
      });

    request = await createHttpRequest<CustomerProductControllerUpdateRequest>({
      query: {
        customerId,
        productId: 1000,
      },
      body: {
        bookingPeriod: {
          unit: TimeUnit.WEEKS,
          value: 12,
        },
        duration: 12,
        description: "hej med dig",
      },
    });

    const res: HttpSuccessResponse<CustomerProductControllerUpdateResponse> =
      await CustomerProductControllerUpdate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();

    expect(res.jsonBody?.payload).toEqual(
      expect.objectContaining({
        bookingPeriod: {
          unit: TimeUnit.WEEKS,
          value: 12,
        },
        productId,
      })
    );
  });
});
