import { CustomerProductServiceGet } from "~/functions/customer/services/product/get";
import { ScheduleModel, ScheduleProduct } from "~/functions/schedule";
import { shopifyAdmin } from "~/library/shopify";

export const updateParentProductName = "updateParentProduct";
export const updateParentProduct = async ({
  customerId,
  productId,
}: {
  customerId: number;
  productId: number;
}) => {
  const rootProduct = await CustomerProductServiceGet({
    customerId,
    productId,
  });

  const optionMetafield = rootProduct.optionsMetafieldId
    ? {
        id: rootProduct.optionsMetafieldId,
      }
    : {
        key: "options",
        namespace: "booking",
      };

  const { data } = await shopifyAdmin().request(PRODUCT_PARENT_UPDATE, {
    variables: {
      id: `gid://shopify/Product/${productId}`,
      metafields: [
        {
          ...optionMetafield,
          value: JSON.stringify(
            rootProduct?.options?.map(
              (o) => `gid://shopify/Product/${o.productId}`
            )
          ),
        },
      ],
    },
  });

  if (!data?.productUpdate?.product) {
    throw new Error(`Failed to update parent product options${productId}`);
  }

  const newProduct: ScheduleProduct = {
    ...rootProduct,
    optionsMetafieldId: data?.productUpdate?.product?.options?.id,
  };

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

  return data.productUpdate.product;
};

export const PRODUCT_PARENT_UPDATE = `#graphql
  mutation ProductParentUpdate($id: ID, $metafields: [MetafieldInput!]) {
    productUpdate(input: {id: $id, metafields: $metafields}) {
      product {
        options: metafield(key: "options", namespace: "booking") {
          id
        }
      }
    }
  }
` as const;
