import { ScheduleModel } from "~/functions/schedule";
import { createUser } from "~/library/jest/helpers";
import { getProductObject } from "~/library/jest/helpers/product";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { shopifyAdmin } from "~/library/shopify";
import { GidFormat } from "~/library/zod";
import {
  ProductOptionAddMutation,
  ProductOptionDuplicateMutation,
} from "~/types/admin.generated";
import {
  CustomerProductOptionsServiceAdd,
  PRODUCT_OPTION_ADD,
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

    const user = await createUser({ customerId });

    const product = { ...getProductObject({}) };

    const newSchedule = await createSchedule({
      name: "Test Schedule",
      customerId,
      products: [product],
    });

    const mockProductDuplcate: ProductOptionDuplicateMutation = {
      productDuplicate: {
        newProduct: {
          id: "gid://shopify/Product/9186772386119",
          title: "New Product Title",
          handle: "ikadsk",
          tags: [],
          parentId: {
            id: "gid://shopify/Metafield/44499605258567",
            value: "",
          },
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

    const tags = [
      `user`,
      `user-${user.username}`,
      `userid-${customerId}`,
      `options`,
      `parentid-${product.productId}`,
      `parent-${product.productHandle}`,
    ];

    const mockProductUpdate: ProductOptionAddMutation = {
      productUpdate: {
        product: {
          id: "gid://shopify/Product/9186772386119",
          title: "New Product Title",
          handle: "ikadsk",
          tags,
          parentId: {
            id: "gid://shopify/Metafield/44499605258567",
            value: `gid://shopify/Product/${product.productId}`,
          },
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

    mockRequest
      .mockResolvedValueOnce({
        data: mockProductDuplcate,
      })
      .mockResolvedValueOnce({
        data: mockProductUpdate,
      });

    const result = await CustomerProductOptionsServiceAdd({
      customerId,
      productId: product.productId,
      cloneId,
      title: mockProductDuplcate.productDuplicate?.newProduct?.title!,
    });

    //expect(result).toHaveLength(1);
    expect(shopifyAdmin.request).toHaveBeenCalledTimes(2);
    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(
      1,
      PRODUCT_OPTION_DUPLCATE,
      {
        variables: {
          productId: `gid://shopify/Product/${cloneId}`,
          title: mockProductDuplcate.productDuplicate?.newProduct?.title!,
        },
      }
    );
    expect(shopifyAdmin.request).toHaveBeenNthCalledWith(
      2,
      PRODUCT_OPTION_ADD,
      {
        variables: {
          id: mockProductDuplcate.productDuplicate?.newProduct?.id,
          metafields: [
            {
              id: mockProductDuplcate.productDuplicate?.newProduct?.parentId
                ?.id,
              value: `gid://shopify/Product/${product.productId}`,
            },
          ],
          tags: tags.join(", "),
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
      GidFormat.parse(mockProductDuplcate.productDuplicate?.newProduct?.id)
    );
    expect(options.variants).toHaveLength(3);
    const variant = options.variants[0];
    expect(variant.duration.metafieldId).toBe(3);
    expect(variant.duration.value).toBe(1);
  });
});
