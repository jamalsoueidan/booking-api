import { shopifyAdmin } from "~/library/shopify";

export type CustomerProductOptionsDestroyProps = {
  customerId: number;
  productId: string;
};

export async function CustomerProductOptionsDestroyService(
  props: CustomerProductOptionsDestroyProps
) {
  const { data } = await shopifyAdmin.request(PRODUCT_OPTION_DESTROY, {
    variables: {
      id: `gid://shopify/Product/${props.productId}`,
    },
  });

  return data?.productDeleteAsync?.job;
}

export const PRODUCT_OPTION_DESTROY = `#graphql
  mutation productOptionDestroy($id: ID!) {
    productDeleteAsync(productId: $id) {
      job {
        done
        id
      }
    }
  }
` as const;
