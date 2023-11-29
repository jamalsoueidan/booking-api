import { z } from "zod";
import {
  Schedule,
  ScheduleModel,
  ScheduleProduct,
  ScheduleZodSchema,
} from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";

type CustomerProductsServiceListIdsProps = {
  customerId: Schedule["customerId"];
};

export const CustomerProductsServiceListIds = async (
  filter: CustomerProductsServiceListIdsProps
) => {
  const schedules = await ScheduleModel.find(filter).select(
    "products.productId"
  );

  return schedules.flatMap((schedule) =>
    schedule.products.map((product) => product.productId)
  );
};

type CustomerProductsServiceListProps = {
  customerId: Schedule["customerId"];
  scheduleId?: Schedule["_id"];
};

export const CustomerProductsServiceList = async ({
  customerId,
  scheduleId,
}: CustomerProductsServiceListProps) => {
  let query: any = { customerId };
  if (scheduleId !== undefined) {
    query._id = scheduleId;
  }

  const schedules = await ScheduleModel.find(query)
    .select("name products")
    .lean();

  return schedules.flatMap((schedule) =>
    schedule.products.map((product) => ({
      scheduleId: schedule._id,
      scheduleName: schedule.name,
      ...product,
    }))
  );
};

export type CustomerProductServiceDestroyFilter = {
  customerId: Schedule["customerId"];
  productId: ScheduleProduct["productId"];
};

export const CustomerProductServiceDestroy = async (
  filter: CustomerProductServiceDestroyFilter
) => {
  try {
    return ScheduleModel.updateOne(
      {
        customerId: filter.customerId,
        products: {
          $elemMatch: {
            productId: filter.productId,
          },
        },
      },
      { $pull: { products: { productId: filter.productId } } },
      { new: true }
    ).lean();
  } catch (error) {
    console.error("Error destroying product:", error);
  }
};

export type CustomerProductServiceUpsert = {
  customerId: Schedule["customerId"];
  productId: ScheduleProduct["productId"];
};

export type CustomerProductServiceUpsertBody = Omit<
  ScheduleProduct,
  "productId"
> & {
  scheduleId: z.infer<typeof ScheduleZodSchema.shape._id>;
};

export const CustomerProductServiceUpsert = async (
  filter: CustomerProductServiceUpsert,
  product: CustomerProductServiceUpsertBody
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

export type CustomerProductServiceGetFilter = {
  customerId: Schedule["customerId"];
  productId: ScheduleProduct["productId"];
};

export const CustomerProductServiceGet = async (
  filter: CustomerProductServiceGetFilter
) => {
  const schedule = await ScheduleModel.findOne({
    customerId: filter.customerId,
    products: {
      $elemMatch: {
        productId: filter.productId,
      },
    },
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

  const product = schedule.products.find(
    (p) => p.productId === filter.productId
  );

  if (!product) {
    throw new NotFoundError([
      {
        code: "custom",
        message: "PRODUCT_NOT_FOUND",
        path: ["productId"],
      },
    ]);
  }

  return {
    ...product,
    scheduleId: schedule._id,
    scheduleName: schedule.name,
  };
};

export const CustomerProductServiceRemoveLocationFromAll = async (filter: {
  locationId: string;
  customerId: number;
}) => {
  const schedules = await ScheduleModel.find({ customerId: filter.customerId });

  for (let schedule of schedules) {
    for (let product of schedule.products) {
      product.locations = product.locations.filter(
        (location) =>
          location.location.toString() !== filter.locationId.toString()
      );
    }

    await schedule.save();
  }
};
