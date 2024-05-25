import { Schedule, ScheduleModel, ScheduleProduct } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";
import { shopifyAdmin } from "~/library/shopify";
import { MetafieldInput } from "~/types/admin.types";
import { CustomerServiceGet } from "../customer/get";
import { LocationModel } from "./../../../location/location.model";
import { PRODUCT_FRAGMENT } from "./add";
import { CustomerProductServiceGet } from "./get";

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
  const user = await CustomerServiceGet({
    customerId,
  });

  const { scheduleId, scheduleMetafieldId, scheduleName, ...oldProduct } =
    await CustomerProductServiceGet({
      customerId,
      productId,
    });

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
            value: JSON.stringify(body.locations.map((p) => p.metafieldId)),
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

  const bodyLocations = oldProduct.locations.concat(
    (body.locations || [])?.filter(
      (item2) =>
        !oldProduct.locations.some(
          (item1) => item1.location.toString() === item2.location.toString() // must use toString since location could be type of objectId
        )
    )
  );

  const locations = await LocationModel.find({
    _id: { $in: bodyLocations.map((l) => l.location) },
  });

  if (locations.length !== bodyLocations.length) {
    throw new NotFoundError([
      {
        path: ["customerId", "locations"],
        message: "LOCATIONS_ERROR",
        code: "custom",
      },
    ]);
  }

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
    locations: locations.map((l) => ({
      metafieldId: l.metafieldId,
      locationType: l.locationType,
      originType: l.originType,
      location: l._id,
    })),
    options: mergeArraysUnique(
      oldProduct?.options || [],
      body?.options || [],
      "productId"
    ),
  };

  if (
    metafields.length > 0 ||
    body.title !== oldProduct.title ||
    body.descriptionHtml !== oldProduct.descriptionHtml
  ) {
    await shopifyAdmin.request(PRODUCT_UPDATE, {
      variables: {
        title: body.title || oldProduct.title,
        descriptionHtml: body.descriptionHtml || oldProduct.descriptionHtml,
        id: `gid://shopify/Product/${productId}`,
        metafields: [
          ...metafields,
          {
            id: oldProduct?.scheduleIdMetafieldId,
            value: scheduleMetafieldId,
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
          `scheduleid-${scheduleId}`,
        ]
          .concat(locations.map((l) => `locationid-${l._id}`))
          .concat(
            locations.map(
              (l) => `city-${l.city.replace(/ /g, "-").toLowerCase()}`
            )
          )
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
    scheduleId: scheduleId.toString(),
    scheduleName,
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
  mutation ProductUpdate($id: ID, $metafields: [MetafieldInput!], $tags: [String!], $title: String, $descriptionHtml: String) {
    productUpdate(input: {id: $id, metafields: $metafields, tags: $tags, title: $title, descriptionHtml: $descriptionHtml}) {
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
