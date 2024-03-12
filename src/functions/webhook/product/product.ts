import { InvocationContext } from "@azure/functions";

import { telemetryClient } from "~/library/application-insight";
import { connect } from "~/library/mongoose";
import { shopifyAdmin } from "~/library/shopify";
import { ProductVariantCreateMutation } from "~/types/admin.generated";
import { ProductUpdateSchema } from "./types";
import { ProductWebHookGetUnusedVariantIds } from "./unused";

export async function webhookProductProcess(
  queueItem: unknown,
  context: InvocationContext
) {
  try {
    await connect();
    const product = queueItem as ProductUpdateSchema;
    const unusedVariantIds = await ProductWebHookGetUnusedVariantIds({
      product,
    });

    const { body } = await shopifyAdmin.query<ProductVariantCreateMutation>({
      data: {
        query: MUTATION_DESTROY_VARIANTS,
        variables: {
          productId: product.admin_graphql_api_id,
          variantsIds: unusedVariantIds.map(
            (l) => `gid://shopify/ProductVariant/${l}`
          ),
        },
      },
    });

    if (!body.productVariantCreate?.product) {
      context.error(
        "webhook product error",
        body.productVariantCreate?.userErrors
      );
    }

    context.log("webhook product success");
  } catch (exception: unknown) {
    console.log(exception);
    telemetryClient.trackException({
      exception: exception as Error,
    });
    context.error(
      `webhook order error ${(queueItem as any).order_id}`,
      exception
    );
  }
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
