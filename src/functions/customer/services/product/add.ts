import { Schedule, ScheduleModel, ScheduleProduct } from "~/functions/schedule";
import { FoundError, NotFoundError } from "~/library/handler";
import { StringOrObjectIdType } from "~/library/zod";

export type CustomerProductServiceAdd = {
  customerId: Schedule["customerId"];
};

export type CustomerProductServiceAddBody = Omit<
  ScheduleProduct,
  "description" | "duration" | "breakTime" | "noticePeriod" | "bookingPeriod"
> & {
  scheduleId: StringOrObjectIdType;
};

export const CustomerProductServiceAdd = async (
  filter: CustomerProductServiceAdd,
  product: CustomerProductServiceAddBody
) => {
  const productExistInSchedule = await ScheduleModel.exists({
    customerId: filter.customerId,
    "products.productId": { $eq: product.productId },
  });

  if (productExistInSchedule) {
    throw new FoundError([
      {
        code: "custom",
        message: "PRODUCT_ALREADY_EXIST",
        path: ["productId"],
      },
    ]);
  }

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
    .lean()
    .orFail(
      new NotFoundError([
        {
          code: "custom",
          message: "SCHEDULE_NOT_FOUND",
          path: ["productId"],
        },
      ])
    );

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
    scheduleId: newSchedule._id.toString(),
    scheduleName: newSchedule.name,
  };
};
