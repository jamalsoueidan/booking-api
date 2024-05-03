import {
  Schedule,
  ScheduleModel,
  ScheduleProduct,
  ScheduleProductOption,
} from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";

export type CustomerProductServiceUpdate = {
  customerId: Schedule["customerId"];
  productId: ScheduleProduct["productId"];
};

export type CustomerProductServiceUpdateBody = Partial<
  Omit<ScheduleProduct, "productId">
>;

export const CustomerProductServiceUpdate = async (
  filter: CustomerProductServiceUpdate,
  product: CustomerProductServiceUpdateBody
) => {
  const schedule = await ScheduleModel.findOne({
    customerId: filter.customerId,
    "products.productId": filter.productId,
  })
    .orFail(
      new NotFoundError([
        {
          code: "custom",
          message: "PRODUCT_NOT_FOUND",
          path: ["productId"],
        },
      ])
    )
    .lean();

  const oldProduct = schedule.products.find(
    (p) => p.productId === filter.productId
  );

  const newProduct = {
    ...oldProduct,
    ...product,
    options: mergeArraysUnique(
      oldProduct?.options || [],
      product?.options || [],
      "productId"
    ),
  };

  await ScheduleModel.updateOne(
    {
      customerId: filter.customerId,
      "products.productId": filter.productId,
    },
    {
      $set: {
        "products.$": newProduct,
      },
    }
  );

  return {
    ...newProduct,
    scheduleId: schedule._id.toString(),
    scheduleName: schedule.name,
  };
};

function mergeArraysUnique(
  arr1: Array<ScheduleProductOption>,
  arr2: Array<ScheduleProductOption>,
  uniqueKey: keyof ScheduleProductOption
) {
  const merged = new Map();
  arr1.forEach((item) => merged.set(item[uniqueKey], item));
  arr2.forEach((item) => {
    if (!merged.has(item[uniqueKey])) {
      merged.set(item[uniqueKey], item);
    } else {
      merged.set(item[uniqueKey], {
        ...merged.get(item[uniqueKey]),
        ...item,
      });
    }
  });

  return Array.from(merged.values());
}
