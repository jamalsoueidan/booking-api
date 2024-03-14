import { connect } from "~/library/mongoose";
import { shopifyAdmin } from "~/library/shopify";
import { ProductUpdateSchema } from "./types";
import { ProductWebHookGetUnusedVariantIds } from "./unused";

export async function deleteVariantsHandler(product: ProductUpdateSchema) {
  await connect();
  let unusedVariantIds = await ProductWebHookGetUnusedVariantIds({
    product,
  });

  if (product.variants.length === unusedVariantIds.length) {
    unusedVariantIds = unusedVariantIds.slice(0, -1);
  }

  if (unusedVariantIds.length > 0) {
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

  return undefined;
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
