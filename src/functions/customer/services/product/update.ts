import { Schedule, ScheduleModel, ScheduleProduct } from "~/functions/schedule";
import { UserModel } from "~/functions/user";
import { NotFoundError } from "~/library/handler";
import { shopifyAdmin } from "~/library/shopify";
import { MetafieldInput } from "~/types/admin.types";
import { PRODUCT_FRAGMENT } from "./add";

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

  const metafields: MetafieldInput[] = [
    ...(body.hasOwnProperty("hideFromProfile")
      ? [
          {
            id: oldProduct?.hideFromProfileMetafieldId,
            value: String(body.hideFromProfile),
          },
        ]
      : []),
    ...(body.hasOwnProperty("hideFromCombine")
      ? [
          {
            id: oldProduct?.hideFromCombineMetafieldId,
            value: String(body.hideFromCombine),
          },
        ]
      : []),
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
    ...(user.userMetaobjectId !== oldProduct.user?.value
      ? [
          {
            id: oldProduct?.user?.metaobjectId,
            value: user.userMetaobjectId,
          },
        ]
      : []),
  ];

  if (user.active !== oldProduct.active) {
    metafields.push({
      id: oldProduct.activeMetafieldId,
      value: user.active.toString(),
    });
  }

  const locations = oldProduct.locations.concat(
    (body.locations || [])?.filter(
      (item2) =>
        !oldProduct.locations.some(
          (item1) => item1.location.toString() === item2.location.toString() // must use toString since location is type of objectId
        )
    )
  );

  const newProduct = {
    ...oldProduct,
    ...body,
    active: user.active,
    user: {
      ...oldProduct.user,
      value: user.images?.profile?.metaobjectId || oldProduct.user?.value,
    },
    noticePeriod: {
      ...oldProduct.noticePeriod,
      ...body.noticePeriod,
    },
    bookingPeriod: {
      ...oldProduct.bookingPeriod,
      ...body.bookingPeriod,
    },
    compareAtPrice: {
      ...oldProduct.compareAtPrice,
      ...body.compareAtPrice,
    },
    price: {
      ...oldProduct.price,
      ...body.price,
    },
    locations: locations,
    options: mergeArraysUnique(
      oldProduct?.options || [],
      body?.options || [],
      "productId"
    ),
  };

  if (metafields.length > 0) {
    await shopifyAdmin.request(PRODUCT_UPDATE, {
      variables: {
        descriptionHtml: body.description || oldProduct.description,
        id: `gid://shopify/Product/${productId}`,
        metafields: [
          ...metafields,
          {
            id: oldProduct?.scheduleIdMetafieldId,
            value: schedule._id.toString(),
          },
        ],
        tags: [
          "user",
          `user-${user.username}`,
          `userid-${user.customerId}`,
          "treatments",
          `parentid-${oldProduct.parentId}`,
          `productid-${oldProduct.productId}`,
          `product-${oldProduct.productHandle}`,
          `scheduleid-${schedule._id}`,
        ]
          .concat(newProduct.locations.map((l) => `locationid-${l.location}`))
          .join(", "),
      },
    });
  }

  if (body.price && body.compareAtPrice) {
    await shopifyAdmin.request(PRODUCT_PRICE_UPDATE, {
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

  return Array.from(merged.values()) as T[];
}

export const PRODUCT_UPDATE = `#graphql
  ${PRODUCT_FRAGMENT}
  mutation ProductUpdate($id: ID, $metafields: [MetafieldInput!], $tags: [String!], $descriptionHtml: String) {
    productUpdate(input: {id: $id, metafields: $metafields, tags: $tags, descriptionHtml: $descriptionHtml}) {
      product {
        ...ProductFragment
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
