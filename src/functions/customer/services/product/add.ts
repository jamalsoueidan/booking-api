import { Schedule, ScheduleModel, ScheduleProduct } from "~/functions/schedule";
import { ShopifyError } from "~/library/handler";
import { shopifyAdmin } from "~/library/shopify";
import { GidFormat, StringOrObjectIdType } from "~/library/zod";
import { CustomerProductServiceUpdate } from "./update";

export type CustomerProductServiceAdd = {
  customerId: Schedule["customerId"];
};

export type CustomerProductServiceAddBody = Pick<
  ScheduleProduct,
  "parentId" | "locations" | "price" | "compareAtPrice"
> & {
  title: string;
  scheduleId: StringOrObjectIdType;
};

export const CustomerProductServiceAdd = async (
  { customerId }: CustomerProductServiceAdd,
  product: CustomerProductServiceAddBody
) => {
  const { data } = await shopifyAdmin.request(PRODUCT_DUPLCATE, {
    variables: {
      productId: `gid://shopify/Product/${product.parentId}`,
      title: product.title,
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

  const newProduct = {
    ...product,
    parentId: product.parentId,
    productHandle: shopifyProduct.handle,
    productId: shopifyProductId,
    variantId: GidFormat.parse(variant.id),
    price: {
      amount: product.price.amount,
      currencyCode: "DKK",
    },
    compareAtPrice: {
      amount: product.compareAtPrice.amount,
      currencyCode: "DKK",
    },
    durationMetafieldId: shopifyProduct.duration?.id,
    breakTimeMetafieldId: shopifyProduct.breaktime?.id,
    noticePeriod: {
      valueMetafieldId: shopifyProduct.noticePeriodValue?.id,
      value: parseInt(shopifyProduct.noticePeriodValue?.value || ""),
      unitMetafieldId: shopifyProduct.noticePeriodUnit?.id,
      unit: shopifyProduct.noticePeriodUnit?.value as any,
    },
    bookingPeriod: {
      valueMetafieldId: shopifyProduct.bookingPeriodValue?.id,
      value: parseInt(shopifyProduct.bookingPeriodValue?.value || ""),
      unitMetafieldId: shopifyProduct.bookingPeriodUnit?.id,
      unit: shopifyProduct.bookingPeriodUnit?.value as any,
    },
    locationsMetafieldId: shopifyProduct.locations?.id,
  };

  await ScheduleModel.updateOne(
    {
      _id: product.scheduleId,
      customerId,
    },
    {
      $push: {
        products: newProduct,
      },
    },
    { new: true }
  );

  return CustomerProductServiceUpdate(
    { customerId, productId: shopifyProductId },
    {
      price: {
        amount: product.price.amount,
        currencyCode: "DKK",
      },
      compareAtPrice: {
        amount: product.compareAtPrice.amount,
        currencyCode: "DKK",
      },
      locations: product.locations,
    }
  );
};

export const PRODUCT_DUPLCATE = `#graphql
  mutation productDuplicate($productId: ID!, $title: String!) {
    productDuplicate(newTitle: $title, productId: $productId, includeImages: true) {
      newProduct {
        id
        handle
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
