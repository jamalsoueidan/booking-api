import { CollectionModel } from "~/functions/collection";
import { ProductModel } from "~/functions/product";
import { ShopifyServiceLoadCollections } from "./load-collections";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("./get-collections", () => ({
  ShopifyServiceGetCollections: jest.fn().mockResolvedValue([
    {
      id: "gid://shopify/Collection/428546621714",
      title: "Kurbehandlinger",
      image: {
        url: "https://cdn.shopify.com/s/files/1/0682/4060/5458/collections/433297_medium_zoom-4b.jpg?v=1670173558",
      },
    },
  ]),
  ShopifyServiceGetProducts: jest.fn().mockResolvedValue([
    {
      id: "gid://shopify/Product/8022089171218",
      title: "Nioplex stand alone",
      featuredImage: null,
    },
    {
      id: "gid://shopify/Product/8022089138450",
      title: "Nioplex i forb. med farver/striber",
      featuredImage: {
        url: "https://cdn.shopify.com/s/files/1/0682/4060/5458/collections/Balayage.webp?v=1670173633",
      },
    },
  ]),
}));

describe("ShopifyServiceLoadCollections", () => {
  it("loads collections and products", async () => {
    await ShopifyServiceLoadCollections();

    const collection = await CollectionModel.findOne({
      collectionId: 428546621714,
    });
    expect(collection?.productIds.length).toBe(2);
    expect(collection?.productIds).toContainEqual(8022089171218);
    expect(collection?.productIds).toContainEqual(8022089138450);

    const product = await ProductModel.findOne({ productId: 8022089171218 });
    expect(product?.users.length).toBe(0);
  });
});
