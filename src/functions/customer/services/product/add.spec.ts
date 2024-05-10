import { faker } from "@faker-js/faker";
import { createUser } from "~/library/jest/helpers";
import { getProductObject } from "~/library/jest/helpers/product";
import { shopifyAdmin } from "~/library/shopify";
import { ProductDuplicateMutation } from "~/types/admin.generated";
import { CustomerScheduleServiceCreate } from "../schedule/create";
import { GidFormat } from "./../../../../library/zod/index";
import {
  CustomerProductServiceAdd,
  PRODUCT_DUPLCATE,
  PRODUCT_UPDATE_TAG,
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

describe("CustomerProductServiceAdd", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    (shopifyAdmin.request as jest.Mock).mockClear();
  });

  it("should add a new product to the schedule", async () => {
    const customerId = 123;
    const user = await createUser({ customerId });

    mockRequest
      .mockResolvedValueOnce({
        data: mockProduct,
      })
      .mockResolvedValueOnce({
        data: {
          productUpdate: {
            product: {
              id: mockProduct.productDuplicate?.newProduct?.id,
              tags: [
                "user",
                "treatments",
                `user-${user.username}`,
                `customer-${user.customerId}`,
                `product-${GidFormat.parse(
                  mockProduct.productDuplicate?.newProduct?.id
                )}`,
                `product-${mockProduct.productDuplicate?.newProduct?.handle}`,
              ],
            },
          },
        },
      });

    const newSchedule = await CustomerScheduleServiceCreate({
      name: "Test Schedule",
      customerId,
    });

    const productBody = {
      ...getProductObject({
        productHandle: faker.internet.url(),
        variantId: faker.number.int({ min: 1, max: 10000000 }),
        price: {
          amount: "0",
          currencyCode: "DKK",
        },
        selectedOptions: {
          name: "test",
          value: "ok",
        },
      }),
      scheduleId: newSchedule._id,
      title: "okay okay",
    };

    const updateProduct = await CustomerProductServiceAdd(
      {
        customerId: newSchedule.customerId,
      },
      productBody
    );

    expect(shopifyAdmin.request).toHaveBeenCalledTimes(2);
    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(1, PRODUCT_DUPLCATE, {
      variables: {
        productId: `gid://shopify/Product/${productBody.parentId}`,
        title: productBody.title,
      },
    });
    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(
      2,
      PRODUCT_UPDATE_TAG,
      {
        variables: {
          id: mockProduct.productDuplicate?.newProduct?.id,
          tags: `user, treatment, user-${user.username}, customer-${
            user.customerId
          }, product-${GidFormat.parse(
            mockProduct.productDuplicate?.newProduct?.id
          )}, product-${mockProduct.productDuplicate?.newProduct?.handle}`,
        },
      }
    );

    expect(updateProduct).toMatchObject({
      parentId: productBody.productId,
      productId: GidFormat.parse(mockProduct.productDuplicate?.newProduct?.id),
      scheduleId: newSchedule._id.toString(),
      variantId: GidFormat.parse(
        mockProduct.productDuplicate?.newProduct?.variants.nodes[0].id
      ),
    });
  });

  it("not allow same product in any schedule belonging to same customer", async () => {
    const customerId = 123;
    const name = "Test Schedule";
    const user = await createUser({ customerId });

    mockRequest.mockResolvedValueOnce({
      data: mockProduct,
    });

    const newSchedule = await CustomerScheduleServiceCreate({
      name,
      customerId,
    });

    const productBody = {
      ...getProductObject({
        productHandle: faker.internet.url(),
        variantId: faker.number.int({ min: 1, max: 10000000 }),
        price: {
          amount: "0",
          currencyCode: "DKK",
        },
        selectedOptions: {
          name: "test",
          value: "ok",
        },
      }),
      scheduleId: newSchedule._id,
      title: "okay okay",
    };

    let updateProduct = await CustomerProductServiceAdd(
      {
        customerId: newSchedule.customerId,
      },
      productBody
    );

    expect(updateProduct).toBeDefined();

    await expect(
      CustomerProductServiceAdd(
        {
          customerId: newSchedule.customerId,
        },
        { ...productBody }
      )
    ).rejects.toThrow();
  });
});
