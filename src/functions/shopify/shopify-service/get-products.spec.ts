import { request } from "graphql-request";
import { ShopifyServiceGetProducts } from "./get-products";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("graphql-request");

describe("ShopifyServiceGetProducts", () => {
  it("fetches products from the Shopify API", async () => {
    const mockData: ShopifyServiceGetProducts = {
      collection: {
        products: {
          nodes: [
            {
              id: "123",
              title: "Product Title",
              featuredImage: {
                url: "https://example.com/image.jpg",
              },
            },
          ],
        },
      },
    };

    (request as jest.Mock).mockResolvedValue(mockData);

    const result = await ShopifyServiceGetProducts(
      "gid://shopify/Collection/428546621714"
    );
    expect(result).toEqual(mockData.collection.products.nodes);
  });
});
