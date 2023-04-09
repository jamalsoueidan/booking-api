import { addDays, addHours } from "date-fns";
import { GetCollectionsProps } from "./collection.helper";
import {
  CollectionServiceDestroy,
  CollectionServiceGetAll,
} from "./collection.service";

require("@jamalsoueidan/bit-dev.testing-library.mongodb/mongodb.jest");

jest.mock("./collection.helper", () => ({
  __esModule: true,
  getCollections: ({ session, selections, shopify }: GetCollectionsProps) => {
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const mock = require("./collection.mock").default;
    return Promise.resolve(mock);
  },
}));

describe("collection testing", () => {
  it("Should be able create collections", async () => {
    const id = "gid://shopify/Collection/425845817661";
    await CollectionServiceCreate({ session: { shop } } as never, {
      selections: [id],
    });

    const collections = await CollectionServiceGetAll({ shop });
    expect(collections.length).toEqual(2);
  });

  it("Should be able to get collections with product => user relations", async () => {
    await CollectionServiceCreate({ session: { shop } } as never, {
      selections: [
        "gid://shopify/Collection/425845817661",
        "gid://shopify/Collection/425290039613",
      ],
    });

    let collections = await CollectionServiceGetAll({ shop });
    let collection = collections.find((c) => c.collectionId === 425845817661);

    expect(collection?.products.length).toEqual(2);

    let collectionProduct = collection?.products[0];
    expect(collectionProduct?.active).toBeFalsy();

    if (collectionProduct) {
      const user = await createUser();
      const start = addDays(new Date(), 1);

      await createShift({
        end: addHours(start, 5),
        user: user._id,
        start,
        tag: Tag.end_of_week,
      });

      await ProductServiceUpdate(
        { id: collectionProduct._id, shop },
        {
          user: [{ _id: user._id, tag: Tag.end_of_week }],
        }
      );
    }

    collections = await CollectionServiceGetAll({ shop });
    collection = collections.find((c) => c.collectionId === 425845817661);

    expect(collection?.products.length).toEqual(2);
    collectionProduct = collection?.products.find(
      (product) => product._id.toString() === collectionProduct?._id.toString()
    );

    expect(collectionProduct?.user.length).toBe(1);
    expect(collectionProduct?.user[0].avatar).not.toBeNull();
    expect(collectionProduct?.user[0].fullname).not.toBeNull();
  });

  it("Should be able destroy collection", async () => {
    await CollectionServiceCreate({ session: { shop } } as never, {
      selections: [
        "gid://shopify/Collection/425845817661",
        "gid://shopify/Collection/425290039613",
      ],
    });

    let collections = await CollectionServiceGetAll();
    expect(collections.length).toEqual(2);
    await CollectionServiceDestroy({ id: collections[0]._id });
    collections = await CollectionServiceGetAll();
    expect(collections.length).toEqual(1);
  });
});
