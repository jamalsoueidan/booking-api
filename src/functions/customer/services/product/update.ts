import { z } from "zod";
import {
  Schedule,
  ScheduleModel,
  ScheduleProduct,
  ScheduleZodSchema,
} from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";
import { CustomerProductServiceDestroy } from "./destroy";

export type CustomerProductServiceUpdate = {
  customerId: Schedule["customerId"];
  productId: ScheduleProduct["productId"];
};

export type CustomerProductServiceUpdateBody = Partial<
  Omit<ScheduleProduct, "productId"> & {
    scheduleId: z.infer<typeof ScheduleZodSchema.shape._id>;
  }
>;

export const CustomerProductServiceUpdate = async (
  filter: CustomerProductServiceUpdate,
  product: CustomerProductServiceUpdateBody
) => {
  await CustomerProductServiceDestroy(filter);
  const schedule = await ScheduleModel.findOneAndUpdate(
    {
      _id: product.scheduleId,
      customerId: filter.customerId,
    },
    { $push: { products: { ...product, productId: filter.productId } } },
    { new: true, upsert: true }
  )
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

  return {
    ...product,
    productId: filter.productId,
    scheduleId: schedule._id.toString(),
    scheduleName: schedule.name,
  };
};
