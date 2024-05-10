import { Schedule, ScheduleModel, ScheduleProduct } from "~/functions/schedule";
import { UserModel } from "~/functions/user";
import { FoundError, NotFoundError, ShopifyError } from "~/library/handler";
import { shopifyAdmin } from "~/library/shopify";
import { GidFormat, StringOrObjectIdType } from "~/library/zod";

export type CustomerProductServiceAdd = {
  customerId: Schedule["customerId"];
};

export type CustomerProduct = Omit<
  ScheduleProduct,
  "description" | "duration" | "breakTime" | "noticePeriod" | "bookingPeriod"
>;

export type CustomerProductServiceAddBody = CustomerProduct & {
  scheduleId: StringOrObjectIdType;
  title: string;
};

export const CustomerProductServiceAdd = async (
  filter: CustomerProductServiceAdd,
  product: CustomerProductServiceAddBody
) => {
  const user = await UserModel.findOne({
    customerId: filter.customerId,
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

  const productExistInSchedule = await ScheduleModel.exists({
    customerId: filter.customerId,
    "products.parentId": { $eq: product.parentId },
  });

  if (productExistInSchedule) {
    throw new FoundError([
      {
        code: "custom",
        message: "PRODUCT_ALREADY_EXIST",
        path: ["productId"],
      },
    ]);
  }

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

  const newProduct: CustomerProduct &
    Pick<ScheduleProduct, "bookingPeriod" | "noticePeriod"> = {
    ...product,
    parentId: product.productId,
    productHandle: shopifyProduct.handle,
    productId: shopifyProductId,
    variantId: GidFormat.parse(variant.id),
    price: {
      amount: variant.price,
      currencyCode: "DKK",
    },
    compareAtPrice: {
      amount: variant.compareAtPrice,
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

  const newSchedule = await ScheduleModel.findOneAndUpdate(
    {
      _id: product.scheduleId,
      customerId: filter.customerId,
    },
    {
      $push: {
        products: newProduct,
      },
    },
    { new: true }
  )
    .lean()
    .orFail();

  const modelProduct = newSchedule.products.find(
    (p) => p.productId === shopifyProductId
  );

  if (!modelProduct) {
    throw new NotFoundError([
      {
        code: "custom",
        message: "PRODUCT_NOT_FOUND",
        path: ["productId"],
      },
    ]);
  }

  await shopifyAdmin.request(PRODUCT_UPDATE_TAG, {
    variables: {
      id: `gid://shopify/Product/${shopifyProductId}`,
      tags: `user, treatment, user-${user.username}, customer-${user.customerId}, product-${newProduct.productId}, product-${newProduct.productHandle}`,
    },
  });

  return {
    ...modelProduct,
    scheduleId: newSchedule._id.toString(),
    scheduleName: newSchedule.name,
  };
};

export const PRODUCT_DUPLCATE = `#graphql
  mutation productDuplicate($productId: ID!, $title: String!) {
    productDuplicate(newTitle: $title, productId: $productId) {
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

export const PRODUCT_UPDATE_TAG = `#graphql
  mutation productUpdateTag($id: ID!, $tags: [String!]!) {
    productUpdate(input: {tags: $tags, id: $id}) {
      product {
        id
        tags
      }
    }
  }
` as const;
