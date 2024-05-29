import { CustomerServiceGet } from "~/functions/customer/services/customer/get";
import { PRODUCT_FRAGMENT } from "~/functions/customer/services/product/add";
import { CustomerProductServiceGet } from "~/functions/customer/services/product/get";
import { LocationModel } from "~/functions/location";
import { ScheduleModel } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";
import { shopifyAdmin } from "~/library/shopify";

export const updateProductName = "updateProduct";
export const updateProduct = async ({
  customerId,
  productId,
}: {
  customerId: number;
  productId: number;
}) => {
  const user = await CustomerServiceGet({
    customerId,
  });

  const { scheduleMetafieldId, scheduleName, scheduleId, ...product } =
    await CustomerProductServiceGet({
      customerId,
      productId,
    });

  const totalCountOfDefault = await ScheduleModel.aggregate([
    {
      $match: {
        customerId,
        products: {
          $elemMatch: {
            parentId: product.parentId,
            default: true,
          },
        },
      },
    },
    {
      $unwind: {
        path: "$products",
        includeArrayIndex: "string",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $match: {
        "products.parentId": product.parentId,
        "products.default": true,
        "products.productId": { $ne: product.productId },
      },
    },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        totalProducts: 1,
      },
    },
  ]);

  const totalProductsCount = totalCountOfDefault[0]?.totalProducts || 0;

  await ScheduleModel.updateOne(
    {
      customerId,
      "products.productId": productId,
    },
    {
      $set: {
        "products.$": { ...product, default: totalProductsCount === 0 },
      },
    }
  );

  const locations = await LocationModel.find({
    _id: { $in: product.locations.map((l) => l.location) },
  }).orFail(
    new NotFoundError([
      {
        path: ["customerId", "locations"],
        message: "LOCATIONS_ERROR",
        code: "custom",
      },
    ])
  );

  const variables = {
    title: product.title,
    descriptionHtml: product.descriptionHtml || "ads",
    id: `gid://shopify/Product/${product.productId}`,
    metafields: [
      {
        id: product?.hideFromProfileMetafieldId,
        value: String(product.hideFromProfile),
      },
      {
        id: product?.hideFromCombineMetafieldId,
        value: String(product.hideFromCombine),
      },
      {
        id: product?.breakTimeMetafieldId,
        value: String(product.breakTime),
      },
      {
        id: product?.durationMetafieldId,
        value: String(product.duration),
      },
      {
        id: product?.bookingPeriod.valueMetafieldId,
        value: String(product.bookingPeriod.value),
      },
      {
        id: product?.bookingPeriod.unitMetafieldId,
        value: String(product.bookingPeriod.unit),
      },
      {
        id: product?.noticePeriod.valueMetafieldId,
        value: String(product.noticePeriod?.value),
      },
      {
        id: product?.noticePeriod.unitMetafieldId,
        value: String(product.noticePeriod?.unit),
      },
      {
        id: product?.locationsMetafieldId,
        value: JSON.stringify(locations.map((p) => p.metafieldId)),
      },
      {
        id: product?.user?.metaobjectId,
        value: user.userMetaobjectId,
      },
      {
        id: product.activeMetafieldId,
        value: user.active.toString(),
      },
      {
        id: product.defaultMetafieldId,
        value: (totalProductsCount === 0).toString(),
      },
      {
        id: product?.scheduleIdMetafieldId,
        value: scheduleMetafieldId, //reference to scheduleModel.metafieldId, product.scheduleIdMetafieldId reference to product-schedule-metafieldId
      },
    ],
    tags: [
      "user",
      `user-${user.username}`,
      `userid-${user.customerId}`,
      "treatments",
      `parentid-${product.parentId}`,
      `productid-${product.productId}`,
      `product-${product.productHandle}`,
      `scheduleid-${scheduleId}`,
    ]
      .concat(locations.map((l) => `locationid-${l._id}`))
      .concat(
        Array.from(
          new Set(
            locations.map(
              (l) => `city-${l.city.replace(/ /g, "-").toLowerCase()}`
            )
          )
        )
      )
      .join(", "),
  };

  const { data } = await shopifyAdmin().request(PRODUCT_UPDATE, {
    variables,
  });

  if (!data?.productUpdate?.product) {
    throw new Error(`Failed to update product ${product.productId}`);
  }

  return data.productUpdate.product;
};

export const PRODUCT_UPDATE = `#graphql
  ${PRODUCT_FRAGMENT}
  mutation ProductUpdate($id: ID, $metafields: [MetafieldInput!], $tags: [String!], $title: String, $descriptionHtml: String) {
    productUpdate(input: {id: $id, metafields: $metafields, tags: $tags, title: $title, descriptionHtml: $descriptionHtml}) {
      product {
        ...ProductFragment
      }
    }
  }
` as const;
