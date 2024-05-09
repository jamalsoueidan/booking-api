import { HttpRequest, InvocationContext } from "@azure/functions";

import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import { getProductObject } from "~/library/jest/helpers/product";
import { shopifyAdmin } from "~/library/shopify";
import { GidFormat } from "~/library/zod";
import { ProductDuplicateMutation } from "~/types/admin.generated";
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

const mockProduct: ProductDuplicateMutation = {
  productDuplicate: {
    newProduct: {
      id: "gid://shopify/Product/9196220121415",
      handle: "testerne-new-product",
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

describe("CustomerProductControllerAdd", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  const customerId = 123;
  const productId = 1000;

  beforeEach(async () => {
    context = createContext();
    jest.clearAllMocks();
  });

  it("should be able to add slots schedule", async () => {
    mockRequest.mockResolvedValueOnce({
      data: mockProduct,
    });

    const newSchedule = await CustomerScheduleServiceCreate({
      name: "asd",
      customerId,
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
