import { PipelineStage } from "mongoose";
import { ProductModel } from "../product";
import { ShopifyCollection } from "./collection.helper";
import { CollectionModel } from "./collection.model";
import {
  CollectionServiceDestroyProps,
  CollectionServiceGetAllProps,
  CollectionServiceGetAllReturn,
} from "./collection.types";

export const CollectionServiceDestroy = async (
  query: CollectionServiceDestroyProps
) => {
  const { id } = query;

  const collection = await CollectionModel.findOne({
    _id: id,
  });

  if (collection) {
    await CollectionModel.deleteOne({ _id: id });
    await ProductModel.updateMany(
      {
        collectionId: collection.collectionId,
      },
      {
        $set: {
          active: false,
          hidden: true,
        },
      }
    );
  }
  return null;
};

/*export const CollectionServiceCreate = async (
  query: { session: ShopifySession },
  body: CollectionServiceCreateBodyProps
) => {
  const { shop } = query.session;

  const collections = await getCollections({
    selections: body.selections,
    session: query.session,
    shopify: query.session.shopify,
  });

  await CollectionServerCreateBulk({ collections, shop });
};*/

interface CollectionServerCreateBulkProps {
  collections: ShopifyCollection[];
  shop: string;
}

/*export const CollectionServerCreateBulk = async ({
  collections,
  shop,
}: CollectionServerCreateBulkProps) => {
  const getGid = (value: string): number =>
    parseInt(value.substring(value.lastIndexOf("/") + 1), 10);

  // TODO: What about the products that are removed from the collections, they needs to be removed also or moved?
  const collectionBulkWrite = collections?.map((c) => ({
    updateOne: {
      filter: { collectionId: getGid(c.id) },
      update: {
        $set: { collectionId: getGid(c.id), shop, title: c.title },
      },
      upsert: true,
    },
  }));

  const products = collections?.reduce<
    Array<Omit<IProduct, "buffertime" | "active" | "duration" | "user">>
  >((products, currentCollection) => {
    currentCollection.products.nodes.forEach((n) => {
      products.push({
        collectionId: getGid(currentCollection.id),
        hidden: false,
        imageUrl: n.featuredImage?.url || "",
        productId: getGid(n.id),
        title: n.title,
      });
    });
    return products;
  }, []);

  let cleanupProducts = await ProductModel.find(
    { collectionId: { $in: products?.map((p) => p.collectionId) } },
    "collectionId productId"
  );

  cleanupProducts = cleanupProducts.filter(
    (p) =>
      !products.find(
        (pp) =>
          pp.collectionId === p.collectionId && pp.productId === p.productId
      )
  );

  const productsHide = cleanupProducts.map((product) => ({
    updateOne: {
      filter: { _id: product._id },
      update: {
        $set: { active: false, hidden: true },
      },
    },
  }));

  const productsBulkWrite = products.map((product) => ({
    updateOne: {
      filter: { productId: product.productId },
      update: {
        $set: product,
      },
      upsert: true,
    },
  }));

  await CollectionModel.bulkWrite(collectionBulkWrite);
  await ProductModel.bulkWrite([...productsBulkWrite, ...productsHide]);
};*/

export const CollectionServiceGetAll = ({
  group,
}: CollectionServiceGetAllProps = {}) => {
  let pipeline: PipelineStage[] = [
    {
      $lookup: {
        from: "Product",
        let: { cID: "$collectionId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$collectionId", "$$cID"] },
                  { $eq: ["$hidden", false] },
                ],
              },
            },
          },
        ],
        // eslint-disable-next-line sort-keys/sort-keys-fix
        as: "products",
      },
    },
    {
      $unwind: { path: "$products" },
    },
    {
      $unwind: { path: "$products.user", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        as: "products.foreignUser",
        foreignField: "_id",
        from: "User",
        localField: "products.user.user",
      },
    },
    {
      $unwind: {
        path: "$products.foreignUser",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        "products.foreignUser.tag": {
          $cond: {
            if: { $gte: ["$products.user.tag", 0] },
            then: "$products.user.tag",
            // eslint-disable-next-line sort-keys/sort-keys-fix
            else: "$$REMOVE",
          },
        },
        "products.user": {
          $cond: {
            if: { $gte: ["$products.foreignUser", 0] },
            then: "$products.foreignUser",
            // eslint-disable-next-line sort-keys/sort-keys-fix
            else: "$$REMOVE",
          },
        },
      },
    },
    {
      $project: {
        "products.foreignUser": 0,
        "products.user.address": 0,
        "products.user.email": 0,
        "products.user.language": 0,
        "products.user.password": 0,
        "products.user.timeZone": 0,
      },
    },
  ];

  if (group) {
    pipeline.push({
      $match: {
        "products.user.group": group,
      },
    });
  }

  pipeline = [...pipeline, ...restAggreate];

  return CollectionModel.aggregate<CollectionServiceGetAllReturn>(pipeline);
};

const restAggreate = [
  // { $sort: { "products.user.fullname": 1 } },
  {
    $group: {
      _id: {
        _id: "$_id",
        products: "$products._id",
      },
      collection: { $first: "$$ROOT" },
      user: { $push: "$products.user" },
    },
  },
  {
    $addFields: {
      "collection.products.user": "$user",
    },
  },
  {
    $project: {
      _id: 0,
      user: 0,
    },
  },
  // { $sort: { "products.title": 1 } },
  { $replaceRoot: { newRoot: "$collection" } },
  {
    $group: {
      _id: "$_id",
      collection: { $first: "$$ROOT" },
      products: { $push: "$products" },
    },
  },
  {
    $addFields: {
      "collection.products": "$products",
    },
  },
  {
    $project: {
      products: 0,
    },
  },
  { $replaceRoot: { newRoot: "$collection" } },
  // { $sort: { title: 1 } }
];
