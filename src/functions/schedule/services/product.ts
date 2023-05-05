import { NotFoundError } from "~/library/handler";
import { ScheduleModel } from "../schedule.model";
import { Schedule, ScheduleProduct } from "../schedule.types";

export type ScheduleProductServiceDestroyFilter = {
  scheduleId: Schedule["_id"];
  customerId: Schedule["customerId"];
  productId: ScheduleProduct["productId"];
};

export const ScheduleProductServiceDestroy = async (
  filter: ScheduleProductServiceDestroyFilter
) => {
  try {
    const schedule = await ScheduleModel.findOne({
      _id: filter.scheduleId,
      customerId: filter.customerId,
    }).orFail(
      new NotFoundError([
        {
          code: "custom",
          message: "SCHEDULE_NOT_FOUND",
          path: ["schedule"],
        },
      ])
    );

    return schedule.removeProduct(filter.productId);
  } catch (error) {
    console.error("Error destroying product:", error);
  }
};

export type ScheduleProductServiceCreateOrUpdateFilter = {
  scheduleId: Schedule["_id"];
  customerId: Schedule["customerId"];
  productId: ScheduleProduct["productId"];
};

export type ScheduleProductServiceCreateOrUpdateBody = ScheduleProduct;

export const ScheduleProductServiceCreateOrUpdate = async (
  filter: ScheduleProductServiceCreateOrUpdateFilter,
  product: Omit<ScheduleProductServiceCreateOrUpdateBody, "productId">
) => {
  try {
    const schedule = await ScheduleModel.findOne({
      _id: filter.scheduleId,
      customerId: filter.customerId,
    }).orFail(
      new NotFoundError([
        {
          code: "custom",
          message: "SCHEDULE_NOT_FOUND",
          path: ["schedule"],
        },
      ])
    );

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    const productIndex = schedule.products.findIndex(
      (p) => p.productId === filter.productId
    );

    const createProduct = {
      productId: filter.productId,
      ...product,
    };

    if (productIndex !== -1) {
      schedule.products[productIndex] = createProduct;
    } else {
      schedule.products.push(createProduct);
    }
    return schedule.save();
  } catch (error) {
    console.error("Error adding product:", error);
  }
};

export type ScheduleProductServiceGetFilter = {
  scheduleId: Schedule["_id"];
  customerId: Schedule["customerId"];
  productId: ScheduleProduct["productId"];
};

export const ScheduleProductServiceGet = async (
  filter: ScheduleProductServiceCreateOrUpdateFilter
) => {
  const schedule = await ScheduleModel.findOne({
    _id: filter.scheduleId,
    customerId: filter.customerId,
  }).orFail(
    new NotFoundError([
      {
        code: "custom",
        message: "SCHEDULE_NOT_FOUND",
        path: ["schedule"],
      },
    ])
  );

  const productIndex = schedule.products.findIndex(
    (p) => p.productId === filter.productId
  );

  return schedule.products[productIndex];
};
