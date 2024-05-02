import { ScheduleModel } from "~/functions/schedule";
import { getProductObject } from "~/library/jest/helpers/product";
import { shopifyAdmin } from "~/library/shopify";
import { CustomerProductServiceAdd } from "../product/add";
import { CustomerScheduleServiceCreate } from "../schedule/create";
import {
  CustomerProductOptionsDestroyService,
  PRODUCT_OPTION_DESTROY,
} from "./destroy";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("@shopify/admin-api-client", () => ({
  createAdminApiClient: () => ({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin.request as jest.Mock;

describe("CustomerProductOptionsDestroyService", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    (shopifyAdmin.request as jest.Mock).mockClear();
  });

  it("should destroy product", async () => {
    const parentId = 321;
    const productId = 123;
    const customerId = 123123;
    const mockProduct = {
      done: true,
      id: "123",
    };

    const newSchedule = await CustomerScheduleServiceCreate({
      name: "Test Schedule",
      customerId,
    });

    await CustomerProductServiceAdd(
      {
        customerId,
      },
      {
        ...getProductObject({
          productId: parentId,
          options: [
            {
              productId,
              variants: [],
            },
          ],
        }),
        scheduleId: newSchedule._id,
      }
    );

    // Setup mock responses
    mockRequest.mockResolvedValueOnce({
      data: { productDeleteAsync: { job: mockProduct } },
    });

    const result = await CustomerProductOptionsDestroyService({
      customerId,
      parentId,
      productId,
    });

    expect(result).toMatchObject({
      acknowledged: true,
      modifiedCount: 1,
      upsertedId: null,
      upsertedCount: 0,
      matchedCount: 1,
    });

    expect(shopifyAdmin.request).toHaveBeenCalledTimes(1);
    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(
      1,
      PRODUCT_OPTION_DESTROY,
      {
        variables: {
          productId: `gid://shopify/Product/${productId}`,
        },
      }
    );

    let schedule = await ScheduleModel.findOne(newSchedule._id).orFail();
    expect(schedule.products).toHaveLength(1);
    let scheduleProduct = schedule.products[0];
    expect(scheduleProduct.options).toHaveLength(0);
  });
});
