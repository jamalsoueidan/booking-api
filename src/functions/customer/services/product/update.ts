import { Schedule, ScheduleModel, ScheduleProduct } from "~/functions/schedule";
import { UserModel } from "~/functions/user";
import { NotFoundError, ShopifyError } from "~/library/handler";
import { shopifyAdmin } from "~/library/shopify";

export type CustomerProductServiceUpdate = {
  customerId: Schedule["customerId"];
  productId: ScheduleProduct["productId"];
};

export type CustomerProductServiceUpdateBody = Partial<
  Omit<ScheduleProduct, "productId">
>;

export const CustomerProductServiceUpdate = async (
  { customerId, productId }: CustomerProductServiceUpdate,
  body: CustomerProductServiceUpdateBody
) => {
  const user = await UserModel.findOne({
    customerId,
  })
    .orFail(
      new NotFoundError([
        {
          path: ["customerId"],
          message: "NOT_FOUND",
          code: "custom",
        },
      ])
    )
    .lean();

  const schedule = await ScheduleModel.findOne({
    customerId,
    "products.productId": productId,
  })
    .orFail(
      new NotFoundError([
        {
          code: "custom",
          message: "PRODUCT_NOT_FOUND",
          path: ["productId"],
        },
      ])
    )
    .lean();

  const oldProduct = schedule.products.find((p) => p.productId === productId);

  if (!oldProduct) {
    throw new NotFoundError([
      {
        code: "custom",
        message: "PRODUCT_NOT_FOUND",
        path: ["productId"],
      },
    ]);
  }

  const metafields = [
    ...(body.breakTime
      ? [
          {
            id: oldProduct?.breakTimeMetafieldId,
            value: String(body.breakTime),
          },
        ]
      : []),
    ...(body.duration
      ? [
          {
            id: oldProduct?.durationMetafieldId,
            value: String(body.duration),
          },
        ]
      : []),
    ...(body.bookingPeriod
      ? [
          {
            id: oldProduct?.bookingPeriod.valueMetafieldId,
            value: String(body.bookingPeriod.value),
          },
          {
            id: oldProduct?.bookingPeriod.unitMetafieldId,
            value: String(body.bookingPeriod.unit),
          },
        ]
      : []),
    ...(body.noticePeriod
      ? [
          {
            id: oldProduct?.noticePeriod.valueMetafieldId,
            value: String(body.noticePeriod?.value),
          },
          {
            id: oldProduct?.noticePeriod.unitMetafieldId,
            value: String(body.noticePeriod?.unit),
          },
        ]
      : []),
    ...(body.locations
      ? [
          {
            id: oldProduct?.locationsMetafieldId,
            value: JSON.stringify(body.locations),
          },
        ]
      : []),
  ];

  const newProduct = {
    ...oldProduct,
    ...body,
    locations: mergeArraysUnique(
      oldProduct?.locations || [],
      body?.locations || [],
      "location"
    ),
    options: mergeArraysUnique(
      oldProduct?.options || [],
      body?.options || [],
      "productId"
    ),
  };

  if (metafields.length > 0) {
    const { data } = await shopifyAdmin.request(PRODUCT_UPDATE, {
      variables: {
        id: `gid://shopify/Product/${productId}`,
        metafields,
        tags: [
          "user",
          `user-${user.username}`,
          `userid-${user.customerId}`,
          "treatment",
          `productid-${oldProduct.productId}`,
          `product-${oldProduct.productHandle}`,
          `scheduleid-${schedule._id}`,
        ]
          .concat(newProduct.locations.map((l) => `locationid-${l.location}`))
          .join(", "),
      },
    });

    if (!data?.productUpdate?.product) {
      throw new ShopifyError([
        {
          path: ["shopify"],
          message: "GRAPHQL_ERROR",
          code: "custom",
        },
      ]);
    }
  }

  if (body.price && body.compareAtPrice) {
    const { data: price } = await shopifyAdmin.request(PRODUCT_PRICE_UPDATE, {
      variables: {
        id: `gid://shopify/Product/${productId}`,
        variants: [
          {
            id: `gid://shopify/ProductVariant/${oldProduct.variantId}`,
            price: body.price?.amount,
            compareAtPrice: body.compareAtPrice?.amount,
          },
        ],
      },
    });

    if (!price?.productVariantsBulkUpdate?.product) {
      throw new ShopifyError([
        {
          path: ["shopify"],
          message: "GRAPHQL_ERROR",
          code: "custom",
        },
      ]);
    }
  }

  await ScheduleModel.updateOne(
    {
      customerId,
      "products.productId": productId,
    },
    {
      $set: {
        "products.$": newProduct,
      },
    }
  );

  return {
    ...newProduct,
    scheduleId: schedule._id.toString(),
    scheduleName: schedule.name,
  };
};

export function mergeArraysUnique<T>(
  arr1: Array<T>,
  arr2: Array<T>,
  uniqueKey: keyof T
) {
  const merged = new Map();
  arr1.forEach((item) => merged.set(item[uniqueKey], item));
  arr2.forEach((item) => {
    if (!merged.has(item[uniqueKey])) {
      merged.set(item[uniqueKey], item);
    } else {
      merged.set(item[uniqueKey], {
        ...merged.get(item[uniqueKey]),
        ...item,
      });
    }
  });

  return Array.from(merged.values());
}

export const PRODUCT_UPDATE = `#graphql
  mutation ProductUpdate($id: ID, $metafields: [MetafieldInput!], $tags: [String!]) {
    productUpdate(input: {id: $id, metafields: $metafields, tags: $tags}) {
      product {
        id
        variants(first: 1) {
          nodes {
            id
            compareAtPrice
            price
          }
        }
        tags,
        parentId: metafield(key: "parentId", namespace: "booking") {
          id
          value
        }
        scheduleId: metafield(key: "scheduleId", namespace: "booking") {
          id
          value
        }
        locations: metafield(key: "locations", namespace: "booking") {
          id
          value
        }
        bookingPeriodValue: metafield(key: "booking_period_value", namespace: "booking") {
          id
          value
        }
        bookingPeriodUnit: metafield(key: "booking_period_unit", namespace: "booking") {
          id
          value
        }
        noticePeriodValue: metafield(key: "notice_period_value", namespace: "booking") {
          id
          value
        }
        noticePeriodUnit: metafield(key: "notice_period_unit", namespace: "booking") {
          id
          value
        }
        duration: metafield(key: "duration", namespace: "booking") {
          id
          value
        }
        breaktime: metafield(key: "breaktime", namespace: "booking") {
          id
          value
        }
      }
    }
  }
` as const;

export const PRODUCT_PRICE_UPDATE = `#graphql
  mutation productPricepdate($id: ID!, $variants: [ProductVariantsBulkInput!] = {}) {
    productVariantsBulkUpdate(
      productId: $id,
      variants: $variants
    ) {
      product {
        id
        variants(first: 1) {
          nodes {
            id
            compareAtPrice
            price
          }
        }
      }
    }
  }
` as const;
