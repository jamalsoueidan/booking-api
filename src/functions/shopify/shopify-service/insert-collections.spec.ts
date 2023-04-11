import { ShopifyServiceGetCollections } from "./get-collections";
import { ShopifyServiceInsertCollections } from "./insert-collections";

require("~/library/jest/mongoose/mongodb.jest");

describe("ShopifyServiceInsertCollections", () => {
  it("fetches products from the Shopify API", async () => {
    const mockData: ShopifyServiceGetCollections = {
      collections: {
        nodes: [
          {
            id: "gid://shopify/Collection/428546621714",
            title: "Kurbehandlinger",
            image: {
              url: "https://cdn.shopify.com/s/files/1/0682/4060/5458/collections/433297_medium_zoom-4b.jpg?v=1670173558",
            },
          },
          {
            id: "gid://shopify/Collection/428546654482",
            title: "Reflekser/Striper",
            image: {
              url: "https://cdn.shopify.com/s/files/1/0682/4060/5458/collections/Balayage.webp?v=1670173633",
            },
          },
        ],
      },
    };

    const respnose = await ShopifyServiceInsertCollections(
      mockData.collections.nodes
    );
    expect(respnose.upsertedCount).toBe(2);
  });
});
