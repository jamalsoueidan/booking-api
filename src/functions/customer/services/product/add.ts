import { Schedule, ScheduleModel, ScheduleProduct } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";
import { StringOrObjectId } from "~/library/zod";

export type CustomerProductServiceAdd = {
  customerId: Schedule["customerId"];
};

export type CustomerProductServiceAddBody = Omit<
  ScheduleProduct,
  "description" | "duration" | "breakTime" | "noticePeriod" | "bookingPeriod"
> & {
  scheduleId: StringOrObjectId;
};

export const CustomerProductServiceAdd = async (
  filter: CustomerProductServiceAdd,
  product: CustomerProductServiceAddBody
) => {
  const productExistInSchedule = await ScheduleModel.findOne({
    _id: product.scheduleId,
    customerId: filter.customerId,
    "products.productId": { $ne: product.productId },
  }).orFail(
    new NotFoundError([
      {
        code: "custom",
        message: "PRODUCT_ALREADY_EXIST",
        path: ["productId"],
      },
    ])
  );

  const newSchedule = await ScheduleModel.findOneAndUpdate(
    {
      _id: product.scheduleId,
      customerId: filter.customerId,
    },
    {
      $push: {
        products: product,
      },
    },
    { new: true }
  )
    .orFail(
      new NotFoundError([
        {
          code: "custom",
          message: "PRODUCT_ALREADY_EXIST",
          path: ["productId"],
        },
      ])
    )
    .lean();

  const modelProduct = newSchedule.products.find(
    (p) => p.productId === product.productId
  );

  if (!modelProduct) {
    throw new NotFoundError([
      {
        code: "custom",
        message: "PRODUCT_NOT_FOUND",
        path: ["productId"],
      },
    ]);
  }

  return {
    ...modelProduct,
    scheduleId: productExistInSchedule._id.toString(),
    scheduleName: productExistInSchedule.name,
  };
};
