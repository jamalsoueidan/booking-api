import { CustomerServiceGet } from "~/functions/customer/services/customer/get";
import { PRODUCT_FRAGMENT } from "~/functions/customer/services/product/add";
import { CustomerProductServiceGet } from "~/functions/customer/services/product/get";
import { LocationModel } from "~/functions/location";
import { NotFoundError } from "~/library/handler";
import { shopifyAdmin } from "~/library/shopify";

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

  const product = await CustomerProductServiceGet({
    customerId,
    productId,
  });

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

  const { data } = await shopifyAdmin.request(PRODUCT_UPDATE, {
    variables: {
      title: product.title,
      descriptionHtml: product.descriptionHtml,
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
          value: product.user?.value,
        },
        {
          id: product.activeMetafieldId,
          value: user.active.toString(),
        },
        {
          id: product?.scheduleIdMetafieldId,
          value: product?.scheduleIdMetafieldId,
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
        `scheduleid-${product.scheduleId}`,
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
    },
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
