import { ScheduleModel } from "~/functions/schedule";
import { getProductObject } from "~/library/jest/helpers/product";
import { shopifyAdmin } from "~/library/shopify";
import { CustomerProductServiceAdd } from "../product/add";
import { CustomerScheduleServiceCreate } from "../schedule/create";
import {
  CustomerProductOptionsServiceDestroy,
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

  it("should be able to destroy product option", async () => {
    const productId = 321;
    const optionProductId = 123;
    const customerId = 123123;
    const mockProduct = {
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
          productId: productId,
          options: [
            {
              productId: optionProductId,
              variants: [],
            },
          ],
        }),
        scheduleId: newSchedule._id,
      }
    );

    // Setup mock responses
    mockRequest.mockResolvedValueOnce({
      data: { productDelete: { deletedProductId: mockProduct.id } },
    });

    const result = await CustomerProductOptionsServiceDestroy({
      customerId,
      productId,
      optionProductId,
    });

    expect(result).toMatchObject({ deletedProductId: mockProduct.id });

    expect(shopifyAdmin.request).toHaveBeenCalledTimes(1);
    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(
      1,
      PRODUCT_OPTION_DESTROY,
      {
        variables: {
          productId: `gid://shopify/Product/${optionProductId}`,
        },
      }
    );

    let schedule = await ScheduleModel.findOne(newSchedule._id).orFail();
    expect(schedule.products).toHaveLength(1);
    let scheduleProduct = schedule.products[0];
    expect(scheduleProduct.options).toHaveLength(0);
  });
});
