import { ScheduleModel } from "~/functions/schedule";
import { getProductObject } from "~/library/jest/helpers/product";
import { shopifyAdmin } from "~/library/shopify";
import { GidFormat } from "~/library/zod";
import { ProductOptionDuplicateMutation } from "~/types/admin.generated";
import { CustomerProductServiceAdd } from "../product/add";
import { CustomerScheduleServiceCreate } from "../schedule/create";
import {
  CustomerProductOptionsServiceAdd,
  PRODUCT_OPTION_DUPLCATE,
  PRODUCT_OPTION_UPDATE_TAG,
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

    const mockProduct: ProductOptionDuplicateMutation = {
      productDuplicate: {
        newProduct: {
          id: "gid://shopify/Product/9186772386119",
          title: "New Product Title",
          variants: {
            nodes: [
              {
                id: "gid://shopify/ProductVariant/49475617128775",
                title: "Tyk",
                price: "12.00",
                duration: {
                  id: "gid://shopify/Metafield/3",
                  value: "1",
                },
              },
              {
                id: "gid://shopify/ProductVariant/49475617259847",
                title: "Normal",
                price: "12.00",
                duration: {
                  id: "gid://shopify/Metafield/2",
                  value: "2",
                },
              },
              {
                id: "gid://shopify/ProductVariant/49475617358151",
                title: "Meget tyk",
                price: "12.00",
                duration: {
                  id: "gid://shopify/Metafield/1",
                  value: "3",
                },
              },
            ],
          },
        },
      },
    };

    const mockProduct2: ProductOptionDuplicateMutation = {
      productDuplicate: {
        newProduct: {
          id: "gid://shopify/Product/433443",
          title: "New Product Title",
          variants: {
            nodes: [
              {
                id: "gid://shopify/ProductVariant/34",
                title: "Tyk",
                price: "12.00",
                duration: {
                  id: "gid://shopify/Metafield/4",
                  value: "4",
                },
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
        data: {
          productUpdate: {
            product: {
              id: mockProduct.productDuplicate?.newProduct?.id,
              tags: [
                "user",
                "options",
                `customer-${customerId}`,
                `product-9186772386119`,
              ],
            },
          },
        },
      })
      .mockResolvedValueOnce({
        data: mockProduct2,
      })
      .mockResolvedValueOnce({
        data: {
          productUpdate: {
            product: {
              id: mockProduct2.productDuplicate?.newProduct?.id,
              tags: [
                "user",
                "options",
                `customer-${customerId}`,
                `product-${product.productId}`,
              ],
            },
          },
        },
      });

    let result = await CustomerProductOptionsServiceAdd({
      customerId,
      productId: product.productId,
      cloneId,
      title: "New Product",
    });

    expect(result).toEqual(mockProduct.productDuplicate?.newProduct);
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
      PRODUCT_OPTION_UPDATE_TAG,
      {
        variables: {
          id: mockProduct.productDuplicate?.newProduct?.id,
          tags: `user, options, customer-${customerId}, product-${product.productId}`,
        },
      }
    );

    let schedule = await ScheduleModel.findOne(newSchedule._id).orFail();
    expect(schedule).not.toBeNull();
    expect(schedule.products).toHaveLength(1);
    let scheduleProduct = schedule.products[0];
    expect(scheduleProduct.options).toHaveLength(1);
    let options = scheduleProduct?.options![0];
    expect(options.productId).toEqual(
      GidFormat.parse(mockProduct.productDuplicate?.newProduct?.id)
    );
    expect(options.variants).toHaveLength(3);
    const variant = options.variants[0];
    expect(variant.duration.metafieldId).toBe(3);
    expect(variant.duration.value).toBe(1);

    result = await CustomerProductOptionsServiceAdd({
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
    expect(options.productId).toEqual(
      GidFormat.parse(mockProduct2.productDuplicate?.newProduct?.id)
    );
    expect(options.variants).toHaveLength(1);
  });
});
