import { ScheduleModel } from "~/functions/schedule";
import { createUser } from "~/library/jest/helpers";
import { getProductObject } from "~/library/jest/helpers/product";
import { createScheduleWithProducts } from "~/library/jest/helpers/schedule";
import { shopifyAdmin } from "~/library/shopify";
import { GidFormat } from "~/library/zod";
import {
  ProductOptionAddMutation,
  ProductOptionDuplicateMutation,
  ProductParentUpdateMutation,
} from "~/types/admin.generated";
import {
  CustomerProductOptionsServiceAdd,
  PRODUCT_OPTION_ADD,
  PRODUCT_OPTION_DUPLCATE,
  PRODUCT_PARENT_UPDATE,
} from "./add";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/library/shopify", () => ({
  shopifyAdmin: jest.fn().mockReturnValue({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin().request as jest.Mock;

describe("CustomerProductOptionsAddService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be able to add 1 or more options to a product", async () => {
    const customerId = 123;
    const cloneId = 123123;

    const user = await createUser({ customerId });

    const product = { ...getProductObject({}) };

    const newSchedule = await createScheduleWithProducts({
      name: "Test Schedule",
      customerId,
      products: [product],
    });

    const mockProductOptionDuplicate: ProductOptionDuplicateMutation = {
      productDuplicate: {
        newProduct: {
          id: "gid://shopify/Product/9186772386119",
          title: "New Product Title",
          handle: "ikadsk",
          tags: [],
          required: {
            id: "gid://shopify/Metafield/12",
            value: "true",
          },
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

    const mockProductOptionUpdate: ProductOptionAddMutation = {
      productUpdate: {
        product: {
          id: "gid://shopify/Product/9186772386119",
          title: "New Product Title",
          handle: "ikadsk",
          tags,
          required: {
            id: "gid://shopify/Metafield/12",
            value: "true",
          },
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

    const mockProductParentUpdate: ProductParentUpdateMutation = {
      productUpdate: {
        product: {
          options: {
            id: "gid://shopify/Metafield/44505109102919",
          },
        },
      },
    };

    mockRequest
      .mockResolvedValueOnce({
        data: mockProductOptionDuplicate,
      })
      .mockResolvedValueOnce({
        data: mockProductOptionUpdate,
      })
      .mockResolvedValueOnce({
        data: mockProductParentUpdate,
      });

    const result = await CustomerProductOptionsServiceAdd({
      customerId,
      productId: product.productId,
      cloneId,
      title: mockProductOptionDuplicate.productDuplicate?.newProduct?.title!,
    });

    //expect(result).toHaveLength(1);
    expect(mockRequest).toHaveBeenCalledTimes(3);
    expect(mockRequest).toHaveBeenNthCalledWith(1, PRODUCT_OPTION_DUPLCATE, {
      variables: {
        productId: `gid://shopify/Product/${cloneId}`,
        title: mockProductOptionDuplicate.productDuplicate?.newProduct?.title!,
      },
    });
    expect(mockRequest).toHaveBeenNthCalledWith(2, PRODUCT_OPTION_ADD, {
      variables: {
        id: mockProductOptionDuplicate.productDuplicate?.newProduct?.id,
        metafields: [
          {
            id: mockProductOptionDuplicate.productDuplicate?.newProduct
              ?.parentId?.id,
            value: `gid://shopify/Product/${product.productId}`,
          },
        ],
        tags: tags.join(", "),
      },
    });
    expect(mockRequest).toHaveBeenNthCalledWith(3, PRODUCT_PARENT_UPDATE, {
      variables: {
        id: `gid://shopify/Product/${product.productId}`,
        metafields: [
          {
            key: "options",
            namespace: "booking",
            value: JSON.stringify([
              mockProductOptionDuplicate.productDuplicate?.newProduct?.id,
            ]),
          },
        ],
      },
    });

    let schedule = await ScheduleModel.findOne(newSchedule._id).orFail();
    expect(schedule).not.toBeNull();
    expect(schedule.products).toHaveLength(1);
    let scheduleProduct = schedule.products[0];
    expect(scheduleProduct.optionsMetafieldId).toBe(
      mockProductParentUpdate.productUpdate?.product?.options?.id
    );
    expect(scheduleProduct.options).toHaveLength(1);
    let options = scheduleProduct?.options![0];
    expect(options.productId).toEqual(
      GidFormat.parse(
        mockProductOptionDuplicate.productDuplicate?.newProduct?.id
      )
    );
    expect(options.required).toEqual(true);
    expect(options.variants).toHaveLength(3);
    const variant = options.variants[0];
    expect(variant.duration.metafieldId).toBe(3);
    expect(variant.duration.value).toBe(1);
  });
});
