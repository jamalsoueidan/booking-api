import { CustomerServiceGet } from "~/functions/customer/services/customer/get";
import { LocationModel } from "~/functions/location";
import { OpenAIServiceProductCategorize } from "~/functions/openai/services/product-categorize";
import { ScheduleModel } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";
import { shopifyAdmin } from "~/library/shopify";
import { GidFormat } from "~/library/zod";

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

  const schedule = await ScheduleModel.findOne({
    customerId,
    products: {
      $elemMatch: {
        productId,
      },
    },
  }).orFail(
    new NotFoundError([
      {
        code: "custom",
        message: "PRODUCT_NOT_FOUND",
        path: ["productId"],
      },
    ])
  );

  const product = schedule.products.find((p) => p.productId === productId);

  if (!product) {
    throw new NotFoundError([
      {
        code: "custom",
        message: "PRODUCT_NOT_FOUND",
        path: ["productId"],
      },
    ]);
  }

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

  const tags = [];
  if (locations.length > 0) {
    tags.push(
      `location_type-${locations
        .map((l) => l.locationType)
        .join(", location_type-")}`
    );
  }

  if (product.hideFromProfile) {
    tags.push("hide-from-profile");
  }

  if (product.hideFromCombine) {
    tags.push("hide-from-combine");
  }

  if (user.active) {
    tags.push("active");
  }

  const days = schedule.slots.map((slot) => slot.day.toLowerCase());
  if (days.length > 0) {
    tags.push(`day-${days.join(", day-")}`);
  }

  if (!product.hideFromProfile) {
    const categories = await OpenAIServiceProductCategorize({
      title: product.title,
      description: product.description || "",
    });

    categories?.forEach((category) => {
      tags.push(`collectionid-${GidFormat.parse(category.id)}`);

      category.ruleSet?.rules.forEach((r) => {
        tags.push(r.condition);
      });
    });
  }

  const variables = {
    title: product.title,
    descriptionHtml: product.descriptionHtml || "",
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
        id: product?.scheduleIdMetafieldId,
        value: schedule.metafieldId,
      },
    ],
    tags: [
      "user",
      `user-${user.username}`,
      `userid-${user.customerId}`,
      "treatments",
      `productid-${product.productId}`,
      `product-${product.productHandle}`,
      `scheduleid-${schedule._id}`,
    ]
      .concat(tags)
      .concat(product.locations.map((l) => `locationid-${l.location}`))
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

const PRODUCT_FRAGMENT = `#graphql
  fragment UpdateProductFragment on Product {
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

export const PRODUCT_UPDATE = `#graphql
  ${PRODUCT_FRAGMENT}
  mutation ProductUpdate($id: ID, $metafields: [MetafieldInput!], $tags: [String!], $title: String, $descriptionHtml: String) {
    productUpdate(input: {id: $id, metafields: $metafields, tags: $tags, title: $title, descriptionHtml: $descriptionHtml, status: ACTIVE}) {
      product {
        ...UpdateProductFragment
      }
    }
  }
` as const;
