import { ScheduleModel } from "~/functions/schedule";
import { getProductObject } from "~/library/jest/helpers/product";
import { shopifyAdmin } from "~/library/shopify";
import { GidFormat } from "~/library/zod";
import { CustomerProductServiceAdd } from "../product/add";
import { CustomerScheduleServiceCreate } from "../schedule/create";
import {
  CustomerProductOptionsAddService,
  PRODUCT_OPTION_ADD_TAG,
  PRODUCT_OPTION_DUPLCATE,
} from "./add";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("@shopify/admin-api-client", () => ({
  createAdminApiClient: () => ({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin.request as jest.Mock;

describe("CustomerProductOptionsAddService", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    (shopifyAdmin.request as jest.Mock).mockClear();
  });

  it("should be able to add 1 or more options to a product", async () => {
    const customerId = 123;
    const cloneId = 123123;

    const newSchedule = await CustomerScheduleServiceCreate({
      name: "Test Schedule",
      customerId,
    });

    const product = await CustomerProductServiceAdd(
      {
        customerId: newSchedule.customerId,
      },
      {
        ...getProductObject({}),
        scheduleId: newSchedule._id,
      }
    );

    const mockProduct = {
      id: "gid://shopify/Product/9186772386119",
      title: "New Product Title",
      variants: {
        nodes: [
          {
            id: "gid://shopify/ProductVariant/49475617128775",
            title: "Tyk",
          },
          {
            id: "gid://shopify/ProductVariant/49475617259847",
            title: "Normal",
          },
          {
            id: "gid://shopify/ProductVariant/49475617358151",
            title: "Meget tyk",
          },
        ],
      },
    };

    const mockProduct2 = {
      id: "gid://shopify/Product/433443",
      title: "New Product Title",
      variants: {
        nodes: [
          {
            id: "gid://shopify/ProductVariant/34",
            title: "Tyk",
          },
        ],
      },
    };

    mockRequest
      .mockResolvedValueOnce({
        data: { productDuplicate: { newProduct: mockProduct } },
      })
      .mockResolvedValueOnce({
        data: { tagsAdd: { node: { id: mockProduct.id } } },
      })
      .mockResolvedValueOnce({
        data: { productDuplicate: { newProduct: mockProduct2 } },
      })
      .mockResolvedValueOnce({
        data: { tagsAdd: { node: { id: mockProduct2.id } } },
      });

    let result = await CustomerProductOptionsAddService({
      customerId,
      productId: product.productId,
      cloneId,
      title: "New Product",
    });

    expect(result).toEqual(mockProduct);
    expect(shopifyAdmin.request).toHaveBeenCalledTimes(2);
    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(
      1,
      PRODUCT_OPTION_DUPLCATE,
      {
        variables: {
          productId: `gid://shopify/Product/${cloneId}`,
          title: "New Product",
        },
      }
    );
    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(
      2,
      PRODUCT_OPTION_ADD_TAG,
      {
        variables: {
          id: mockProduct.id,
          tags: `customer-${customerId}, product-${product.productId}, user`,
        },
      }
    );

    let schedule = await ScheduleModel.findOne(newSchedule._id).orFail();
    expect(schedule).not.toBeNull();
    expect(schedule.products).toHaveLength(1);
    let scheduleProduct = schedule.products[0];
    expect(scheduleProduct.options).toHaveLength(1);
    let options = scheduleProduct?.options![0];
    expect(options.productId).toEqual(GidFormat.parse(mockProduct.id));
    expect(options.variants).toHaveLength(3);

    result = await CustomerProductOptionsAddService({
      customerId,
      productId: product.productId,
      cloneId: 777,
      title: "New Product",
    });

    schedule = await ScheduleModel.findOne(newSchedule._id).orFail();
    expect(schedule).not.toBeNull();
    expect(schedule.products).toHaveLength(1);
    scheduleProduct = schedule.products[0];
    expect(scheduleProduct.options).toHaveLength(2);
    options = scheduleProduct?.options![1];
    expect(options.productId).toEqual(GidFormat.parse(mockProduct2.id));
    expect(options.variants).toHaveLength(1);
  });
});
