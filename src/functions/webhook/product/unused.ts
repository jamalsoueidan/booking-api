import { ScheduleModel } from "~/functions/schedule";
import { ProductUpdateSchema } from "./types";

export async function ProductWebHookGetUnusedVariantIds({
  product,
}: {
  product: ProductUpdateSchema;
}) {
  let unusedVariantIds = product.variants.map((variant) => variant.id);

  const results = await ScheduleModel.aggregate([
    {
      $match: {
        "products.productId": product.id,
      },
    },
    {
      $unwind: "$products",
    },
    {
      $match: {
        "products.productId": product.id,
        "products.variantId": { $in: unusedVariantIds },
      },
    },
    {
      $group: {
        _id: "$products.productId",
        variantIds: { $addToSet: "$products.variantId" },
      },
    },
  ]);

  if (results.length > 0) {
    const variantIds = results[0].variantIds;
    unusedVariantIds = unusedVariantIds.filter(
      (id) => !variantIds.includes(id)
    );
  }

  return unusedVariantIds;
}
