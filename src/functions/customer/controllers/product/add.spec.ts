import { HttpRequest, InvocationContext } from "@azure/functions";

import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import mongoose from "mongoose";
import { LocationOriginTypes, LocationTypes } from "~/functions/location";
import { createUser } from "~/library/jest/helpers";
import { shopifyAdmin } from "~/library/shopify";
import { GidFormat } from "~/library/zod";
import {
  ProductDuplicateMutation,
  ProductPricepdateMutation,
  ProductUpdateMutation,
} from "~/types/admin.generated";
import { PRODUCT_UPDATE } from "../../services/product/update";
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
  let mockProduct: ProductDuplicateMutation;
  let title: string = "title product";

  beforeEach(async () => {
    context = createContext();
    jest.clearAllMocks();

    mockProduct = {
      productDuplicate: {
        newProduct: {
          id: "gid://shopify/Product/1",
          handle: "testerne-new-product",
          tags: [],
          title,
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
            id: `gid://shopify/Metafield/44429081510215`,
            value: `gid://shopify/Metafield/44429081510215`,
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
            value: `gid://shopify/Product/1`,
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

  it("should be able to add slots schedule", async () => {
    const user = await createUser({ customerId });

    const newSchedule = await CustomerScheduleServiceCreate({
      name: "asd",
      customerId,
    });

    const body: CustomerProductControllerAddRequest["body"] = {
      hideFromCombine: false,
      hideFromProfile: true,
      title,
      description: "ok",
      descriptionHtml: "<b>test</b>",
      scheduleId: newSchedule._id,
      parentId: 1,
      locations: [
        {
          metafieldId: "1",
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

    const tags = [
      `user`,
      `user-${user.username}`,
      `userid-${user.customerId}`,
      `treatments`,
      `parentid-${body.parentId}`,
      `productid-${GidFormat.parse(
        mockProduct.productDuplicate?.newProduct?.id
      )}`,
      `product-${mockProduct.productDuplicate?.newProduct?.handle}`,
      `scheduleid-${newSchedule._id}`,
      `locationid-${body.locations[0].location}`,
    ];

    const mockProductUpdate: ProductUpdateMutation = {
      productUpdate: {
        product: {
          id: `gid://shopify/Product/${GidFormat.parse(
            mockProduct.productDuplicate?.newProduct?.id
          )}}`,
          title,
          variants: {
            nodes: mockProduct.productDuplicate?.newProduct?.variants.nodes!,
          },
          handle: "testerne-new-product",
          tags,
          user: {
            id: `gid://shopify/Metafield/44429081510215`,
            value: `gid://shopify/Metafield/44429081510215`,
          },
          hideFromProfile: {
            id: `gid://shopify/Metafield/44429081510215`,
            value: "true",
          },
          hideFromCombine: {
            id: `gid://shopify/Metafield/233`,
            value: "false",
          },
          active: {
            id: mockProduct.productDuplicate?.newProduct?.active?.id!,
            value: "False",
          },
          parentId: {
            id: mockProduct.productDuplicate?.newProduct?.parentId?.id!,
            value: `gid://shopify/Product/${body.parentId}`,
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
                compareAtPrice: body.compareAtPrice.amount,
                price: body.price.amount,
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

    request = await createHttpRequest<CustomerProductControllerAddRequest>({
      query: {
        customerId,
      },
      body,
    });

    const res: HttpSuccessResponse<CustomerProductControllerAddResponse> =
      await CustomerProductControllerAdd(request, context);

    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(2, PRODUCT_UPDATE, {
      variables: {
        id: mockProduct.productDuplicate?.newProduct?.id,
        title,
        descriptionHtml: body.descriptionHtml,
        metafields: [
          {
            id: mockProductUpdate.productUpdate?.product?.hideFromProfile?.id,
            value: "true",
          },
          {
            id: mockProductUpdate.productUpdate?.product?.hideFromCombine?.id,
            value:
              mockProductUpdate.productUpdate?.product?.hideFromCombine?.value,
          },
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
            value: JSON.stringify(body.locations),
          },
          {
            id: mockProductUpdate.productUpdate?.product?.user?.id,
            value: user.userMetaobjectId,
          },
          {
            id: mockProductUpdate.productUpdate?.product?.active?.id,
            value: "true",
          },
          {
            id: mockProductUpdate.productUpdate?.product?.scheduleId?.id,
            value: newSchedule._id.toString(),
          },
        ],
        tags: tags.join(", "),
      },
    });

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
