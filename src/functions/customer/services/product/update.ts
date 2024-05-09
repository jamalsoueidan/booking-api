import {
  Schedule,
  ScheduleModel,
  ScheduleProduct,
  ScheduleProductOption,
} from "~/functions/schedule";
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
  filter: CustomerProductServiceUpdate,
  body: CustomerProductServiceUpdateBody
) => {
  const schedule = await ScheduleModel.findOne({
    customerId: filter.customerId,
    "products.productId": filter.productId,
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

  const oldProduct = schedule.products.find(
    (p) => p.productId === filter.productId
  );

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

  const { data } = await shopifyAdmin.request(PRODUCT_UPDATE, {
    variables: {
      id: `gid://shopify/Product/${filter.productId}`,
      metafields,
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

  if (body.price && body.compareAtPrice) {
    const { data: price } = await shopifyAdmin.request(PRODUCT_PRICE_UPDATE, {
      variables: {
        productId: `gid://shopify/Product/${filter.productId}`,
        variants: [
          {
            id: data.productUpdate.product.variants.nodes[0].id,
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

  const newProduct = {
    ...oldProduct,
    ...body,
    options: mergeArraysUnique(
      oldProduct?.options || [],
      body?.options || [],
      "productId"
    ),
  };

  await ScheduleModel.updateOne(
    {
      customerId: filter.customerId,
      "products.productId": filter.productId,
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

export function mergeArraysUnique(
  arr1: Array<ScheduleProductOption>,
  arr2: Array<ScheduleProductOption>,
  uniqueKey: keyof ScheduleProductOption
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
  mutation ProductUpdate($id: ID, $metafields: [MetafieldInput!]) {
    productUpdate(input: {id: $id, metafields: $metafields}) {
      product {
        id
        variants(first: 1) {
          nodes {
            id
            compareAtPrice
            price
          }
        }
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
  mutation productPricepdate($productId: ID!, $variants: [ProductVariantsBulkInput!] = {}) {
    productVariantsBulkUpdate(
      productId: $productId,
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
