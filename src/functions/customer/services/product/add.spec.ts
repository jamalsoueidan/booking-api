import { faker } from "@faker-js/faker";
import { getProductObject } from "~/library/jest/helpers/product";
import { shopifyAdmin } from "~/library/shopify";
import { ProductDuplicateMutation } from "~/types/admin.generated";
import { CustomerScheduleServiceCreate } from "../schedule/create";
import { GidFormat } from "./../../../../library/zod/index";
import { CustomerProductServiceAdd } from "./add";

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
    const name = "Test Schedule";

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
    };

    const updateProduct = await CustomerProductServiceAdd(
      {
        customerId: newSchedule.customerId,
      },
      productBody
    );

    expect(updateProduct).toMatchObject({
      parentId: productBody.productId,
      productId: GidFormat.parse(mockProduct.productDuplicate?.newProduct?.id),
      scheduleId: newSchedule._id.toString(),
    });
  });

  it("not allow same product in any schedule belonging to same customer", async () => {
    const customerId = 123;
    const name = "Test Schedule";

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
        { ...productBody, variantId: 12 }
      )
    ).rejects.toThrow();
  });
});
