import { HttpRequest, InvocationContext } from "@azure/functions";

import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import { createUser } from "~/library/jest/helpers";
import {
  createLocation,
  getDumbLocationObject,
} from "~/library/jest/helpers/location";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { shopifyAdmin } from "~/library/shopify";
import { GidFormat } from "~/library/zod";
import { ProductDuplicateMutation } from "~/types/admin.generated";
import {
  CustomerProductControllerAdd,
  CustomerProductControllerAddRequest,
  CustomerProductControllerAddResponse,
} from "./add";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("../../orchestrations/product/add", () => ({
  CustomerProductAddOrchestration: () => ({
    request: jest.fn(),
  }),
}));

jest.mock("~/library/shopify", () => ({
  shopifyAdmin: jest.fn().mockReturnValue({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin().request as jest.Mock;

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

  it("should be able to add product", async () => {
    const user = await createUser({ customerId });

    const newSchedule = await createSchedule({
      name: "asd",
      customerId,
      metafieldId: "gid://shopify/Metafield/533232",
    });
    const location = await createLocation({ customerId: user.customerId });

    const locations = [
      getDumbLocationObject({
        location: location._id,
      }),
    ];

    const body: CustomerProductControllerAddRequest["body"] = {
      hideFromCombine: false,
      hideFromProfile: true,
      title,
      description: "ok",
      descriptionHtml: "<b>test</b>",
      scheduleId: newSchedule._id,
      parentId: 1,
      locations,
      price: {
        amount: "100",
        currencyCode: "DKK",
      },
      compareAtPrice: {
        amount: "150",
        currencyCode: "DKK",
      },
    };

    mockRequest.mockResolvedValueOnce({
      data: mockProduct,
    });

    request = await createHttpRequest<CustomerProductControllerAddRequest>({
      query: {
        customerId,
      },
      body,
      context,
      request,
    });

    const res: HttpSuccessResponse<CustomerProductControllerAddResponse> =
      await CustomerProductControllerAdd(request, context);

    expect(res.jsonBody?.success).toBeTruthy();

    expect(res.jsonBody?.payload.productId).toEqual(
      GidFormat.parse(mockProduct.productDuplicate?.newProduct?.id)
    );
  });
});
