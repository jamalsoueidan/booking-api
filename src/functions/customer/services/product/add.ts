import {
  Schedule,
  ScheduleModel,
  ScheduleProduct,
  TimeUnit,
} from "~/functions/schedule";
import { ShopifyError } from "~/library/handler";
import { shopifyAdmin } from "~/library/shopify";
import { GidFormat, StringOrObjectIdType } from "~/library/zod";

export type CustomerProductServiceAdd = {
  customerId: Schedule["customerId"];
};

export type CustomerProductServiceAddBody = Pick<
  ScheduleProduct,
  | "description"
  | "descriptionHtml"
  | "parentId"
  | "locations"
  | "price"
  | "compareAtPrice"
  | "hideFromCombine"
  | "hideFromProfile"
> & {
  title: string;
  scheduleId: StringOrObjectIdType;
};

export const CustomerProductServiceAdd = async (
  { customerId }: CustomerProductServiceAdd,
  { scheduleId, ...body }: CustomerProductServiceAddBody
) => {
  const { data } = await shopifyAdmin().request(PRODUCT_DUPLCATE, {
    variables: {
      productId: `gid://shopify/Product/${body.parentId}`,
      title: body.title,
    },
  });

  if (!data?.productDuplicate?.newProduct) {
    throw new ShopifyError([
      {
        path: ["shopify"],
        message: "GRAPHQL_ERROR",
        code: "custom",
      },
    ]);
  }

  const shopifyProduct = data.productDuplicate.newProduct;
  const shopifyProductId = GidFormat.parse(shopifyProduct.id);
  const variant = shopifyProduct.variants.nodes[0];

  const newProduct: ScheduleProduct = {
    ...body,
    parentId: body.parentId,
    productHandle: shopifyProduct.handle,
    productId: shopifyProductId,
    variantId: GidFormat.parse(variant.id),
    price: {
      amount: body.price.amount,
      currencyCode: "DKK",
    },
    user: {
      metaobjectId: shopifyProduct.user?.id,
      value: shopifyProduct.user?.value,
    },
    activeMetafieldId: shopifyProduct.active?.id,
    active: false,
    hideFromCombineMetafieldId: shopifyProduct.hideFromCombine?.id,
    hideFromCombine: body.hideFromCombine || false,
    hideFromProfileMetafieldId: shopifyProduct.hideFromProfile?.id,
    hideFromProfile: body.hideFromProfile || false,
    compareAtPrice: {
      amount: body.compareAtPrice.amount,
      currencyCode: "DKK",
    },
    title: shopifyProduct.title,
    scheduleIdMetafieldId: shopifyProduct.scheduleId?.id,
    durationMetafieldId: shopifyProduct.duration?.id,
    duration: 60,
    breakTime: 10,
    breakTimeMetafieldId: shopifyProduct.breaktime?.id,
    noticePeriod: {
      valueMetafieldId: shopifyProduct.noticePeriodValue?.id,
      value: 1,
      unitMetafieldId: shopifyProduct.noticePeriodUnit?.id,
      unit: TimeUnit.HOURS,
    },
    bookingPeriod: {
      valueMetafieldId: shopifyProduct.bookingPeriodValue?.id,
      value: 3,
      unitMetafieldId: shopifyProduct.bookingPeriodUnit?.id,
      unit: TimeUnit.MONTHS,
    },
    locationsMetafieldId: shopifyProduct.locations?.id,
  };

  await ScheduleModel.updateOne(
    {
      _id: scheduleId,
      customerId,
    },
    {
      $push: {
        products: newProduct,
      },
    },
    { new: true }
  );

  return newProduct;
};

export const PRODUCT_FRAGMENT = `#graphql
  fragment ProductFragment on Product {
    id
    handle
    tags
    title
    variants(first: 1) {
      nodes {
        id
        compareAtPrice
        price
      }
    }
    active: metafield(key: "active", namespace: "system") {
      id
      value
    }
    user: metafield(key: "user", namespace: "booking") {
      id
      value
    }
    hideFromCombine: metafield(key: "hide_from_combine", namespace: "booking") {
      id
      value
    }
    hideFromProfile: metafield(key: "hide_from_profile", namespace: "booking") {
      id
      value
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
` as const;

export const PRODUCT_DUPLCATE = `#graphql
  ${PRODUCT_FRAGMENT}
  mutation productDuplicate($productId: ID!, $title: String!) {
    productDuplicate(newTitle: $title, productId: $productId, includeImages: true) {
      newProduct {
        ...ProductFragment
      }
    }
  }
` as const;
