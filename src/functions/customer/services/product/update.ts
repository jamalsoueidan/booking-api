import { z } from "zod";
import {
  Schedule,
  ScheduleModel,
  ScheduleProduct,
  ScheduleZodSchema,
} from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";

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
  const schedule = await ScheduleModel.findOne({
    _id: product.scheduleId,
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

  if (!oldProduct) {
    new NotFoundError([
      {
        code: "custom",
        message: "PRODUCT_NOT_FOUND",
        path: ["productId"],
      },
    ]);
  }

  const newProduct = { ...oldProduct, ...product };

  await ScheduleModel.updateOne(
    {
      _id: product.scheduleId,
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
