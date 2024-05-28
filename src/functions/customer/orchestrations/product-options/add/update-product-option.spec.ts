import { createUser } from "~/library/jest/helpers";
import { getProductObject } from "~/library/jest/helpers/product";
import { createScheduleWithProducts } from "~/library/jest/helpers/schedule";
import { shopifyAdmin } from "~/library/shopify";
import { ProductOptionAddMutation } from "~/types/admin.generated";
import {
  PRODUCT_OPTION_ADD,
  updateProductOption,
} from "./update-product-option";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("~/library/shopify", () => ({
  shopifyAdmin: jest.fn().mockReturnValue({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin().request as jest.Mock;

describe("CustomerProductOptionsAddOrchestration", () => {
  beforeAll(async () => {
    jest.clearAllMocks();
  });

  it("updateProductOption", async () => {
    const customerId = 123;

    const user = await createUser({ customerId });

    const option = {
      parentIdMetafieldId: "gid://shopify/Product/123123312",
      productId: 123,
      title: "new",
      required: true,
      variants: [
        {
          variantId: 1,
          title: "a",
          price: 1,
          duration: {
            metafieldId: 11,
            value: 60,
          },
        },
        {
          variantId: 2,
          title: "b",
          price: 2,
          duration: {
            metafieldId: 22,
            value: 30,
          },
        },
        {
          variantId: 3,
          title: "c",
          price: 2,
          duration: {
            metafieldId: 33,
            value: 15,
          },
        },
      ],
    };

    const product = getProductObject({
      productId: 321,
      options: [option],
    });

    const newSchedule = await createScheduleWithProducts({
      name: "Test Schedule",
      customerId,
      products: [product],
    });

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

    mockRequest.mockResolvedValueOnce({
      data: mockProductOptionUpdate,
    });

    await updateProductOption({
      customerId,
      productId: product.productId,
      productOptionId: option.productId,
    });

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(mockRequest).toHaveBeenNthCalledWith(1, PRODUCT_OPTION_ADD, {
      variables: {
        id: `gid://shopify/Product/${option.productId}`,
        metafields: [
          {
            id: option.parentIdMetafieldId,
            value: `gid://shopify/Product/${product.productId}`,
          },
        ],
        tags: tags.join(", "),
      },
    });
  });
});
