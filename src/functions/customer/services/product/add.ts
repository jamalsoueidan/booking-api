import {
  Schedule,
  ScheduleModel,
  ScheduleProduct,
  TimeUnit,
} from "~/functions/schedule";
import { ShopifyError } from "~/library/handler";
import { shopifyAdmin } from "~/library/shopify";
import { GidFormat, StringOrObjectIdType } from "~/library/zod";
import { CustomerServiceGet } from "../customer/get";

export type CustomerProductServiceAdd = {
  customerId: Schedule["customerId"];
};

export type CustomerProductServiceAddBody = Pick<
  ScheduleProduct,
  | "productType"
  | "description"
  | "descriptionHtml"
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
  const user = await CustomerServiceGet({
    customerId,
  });

  const { data } = await shopifyAdmin().request(PRODUCT_DUPLCATE, {
    variables: {
      productId: `gid://shopify/Product/8022089400594`,
      title: user.username + " " + body.title, // later we remove the username in update-product, this is because of the custom handle
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
    collectionIds: [],
    productHandle: shopifyProduct.handle,
    productId: shopifyProductId,
    variantId: GidFormat.parse(variant.id),
    productType: body.productType,
    price: {
      amount: body.price.amount,
      currencyCode: "DKK",
    },
    user: {
      metaobjectId: shopifyProduct.user?.id,
      value: user.userMetaobjectId,
    },
    defaultMetafieldId: shopifyProduct.default?.id,
    default: false,
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
    title: body.title,
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

const PRODUCT_FRAGMENT = `#graphql
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
    default: metafield(key: "default", namespace: "system") {
      id
      value
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
