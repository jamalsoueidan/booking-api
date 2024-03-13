import { connect } from "~/library/mongoose";
import { shopifyAdmin } from "~/library/shopify";
import { ProductUpdateSchema } from "./types";
import { ProductWebHookGetUnusedVariantIds } from "./unused";

export async function updateVariantsHandler(product: ProductUpdateSchema) {
  await connect();
  const unusedVariantIds = await ProductWebHookGetUnusedVariantIds({
    product,
  });

  const { data } = await shopifyAdmin.request(MUTATION_DESTROY_VARIANTS, {
    variables: {
      productId: product.admin_graphql_api_id,
      variantsIds: unusedVariantIds.map(
        (l) => `gid://shopify/ProductVariant/${l}`
      ),
    },
  });

  return data;
}

const MUTATION_DESTROY_VARIANTS = `#graphql
  mutation productVariantsBulkDelete($productId: ID!, $variantsIds: [ID!]!) {
    productVariantsBulkDelete(productId: $productId, variantsIds: $variantsIds) {
      product {
        id
        title
      }
      userErrors {
        code
        field
        message
      }
    }
  }
` as const;
