import { ScheduleModel } from "~/functions/schedule";
import { createUser } from "~/library/jest/helpers";
import { getProductObject } from "~/library/jest/helpers/product";
import { createScheduleWithProducts } from "~/library/jest/helpers/schedule";
import { shopifyAdmin } from "~/library/shopify";
import { GidFormat } from "~/library/zod";
import { ProductOptionDuplicateMutation } from "~/types/admin.generated";
import {
  CustomerProductOptionsServiceAdd,
  PRODUCT_OPTION_DUPLCATE,
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

    mockRequest.mockResolvedValueOnce({
      data: mockProductOptionDuplicate,
    });

    const result = await CustomerProductOptionsServiceAdd({
      customerId,
      productId: product.productId,
      cloneId,
      title: mockProductOptionDuplicate.productDuplicate?.newProduct?.title!,
    });

    //expect(result).toHaveLength(1);
    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(mockRequest).toHaveBeenNthCalledWith(1, PRODUCT_OPTION_DUPLCATE, {
      variables: {
        productId: `gid://shopify/Product/${cloneId}`,
        title: mockProductOptionDuplicate.productDuplicate?.newProduct?.title!,
      },
    });

    let schedule = await ScheduleModel.findOne(newSchedule._id).orFail();
    expect(schedule).not.toBeNull();
    expect(schedule.products).toHaveLength(1);
    let scheduleProduct = schedule.products[0];
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
