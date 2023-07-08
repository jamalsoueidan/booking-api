import { Schedule, ScheduleModel, ScheduleProduct } from "~/functions/schedule";
import { User } from "~/functions/user";
import { NotFoundError } from "~/library/handler";

type CustomerScheduleServiceCreateBody = Pick<Schedule, "name" | "customerId"> &
  Pick<Partial<Schedule>, "products">;

export const CustomerScheduleServiceCreate = async (
  props: CustomerScheduleServiceCreateBody
) => {
  const newSchedule = new ScheduleModel({
    ...props,
    slots: [
      {
        day: "monday",
        intervals: [
          {
            from: "8:00",
            to: "16:00",
          },
        ],
      },
    ],
  });
  return newSchedule.save();
};

type CustomerScheduleServiceDestroyProps = {
  scheduleId: Schedule["_id"];
  customerId: Schedule["customerId"];
};

export const CustomerScheduleServiceDestroy = async (
  props: CustomerScheduleServiceDestroyProps
) => {
  return ScheduleModel.deleteOne({
    _id: props.scheduleId,
    customerId: props.customerId,
  });
};

type ScheduleServiceUpdateProps = {
  scheduleId: Schedule["_id"];
  customerId: Schedule["customerId"];
};

type CustomerScheduleServiceUpdateBody = Pick<Schedule, "name">;

export const CustomerScheduleServiceUpdate = async (
  filter: ScheduleServiceUpdateProps,
  body: CustomerScheduleServiceUpdateBody
) => {
  const updatedSchedule = await ScheduleModel.findOneAndUpdate(
    { _id: filter.scheduleId, customerId: filter.customerId },
    body,
    {
      new: true,
    }
  ).orFail(
    new NotFoundError([
      {
        code: "custom",
        message: "SCHEDULE_NOT_FOUND",
        path: ["schedule"],
      },
    ])
  );

  return updatedSchedule;
};

type CustomerScheduleServiceListProps = Pick<Schedule, "customerId">;

export const CustomerScheduleServiceList = async (
  filter: CustomerScheduleServiceListProps
) => {
  return ScheduleModel.find(filter).sort("created_at").lean();
};

type CustomerScheduleServiceGetProps = {
  scheduleId: Schedule["_id"];
  customerId: Schedule["customerId"];
};

export const CustomerScheduleServiceGet = async (
  filter: CustomerScheduleServiceGetProps
) => {
  const schedule = await ScheduleModel.findOne({
    _id: filter.scheduleId,
    customerId: filter.customerId,
  })
    .lean()
    .orFail(
      new NotFoundError([
        {
          code: "custom",
          message: "SCHEDULE_NOT_FOUND",
          path: ["schedule"],
        },
      ])
    );
  return schedule;
};

export type CustomerScheduleServiceGetWithCustomerProps = {
  customerId: Schedule["customerId"];
  productIds: Array<ScheduleProduct["productId"]>;
};

export const CustomerScheduleServiceGetWithCustomer = async (
  props: CustomerScheduleServiceGetWithCustomerProps
) => {
  const schedules = await ScheduleModel.aggregate<
    Schedule & { customer: Pick<User, "fullname"> }
  >([
    {
      $match: {
        customerId: props.customerId,
        "products.productId": { $all: props.productIds },
      },
    },
    { $unwind: "$products" },
    { $match: { "products.productId": { $in: props.productIds } } },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        slots: { $first: "$slots" },
        customerId: { $first: "$customerId" },
        products: { $push: "$products" },
      },
    },
    {
      $lookup: {
        from: "User",
        localField: "customerId",
        foreignField: "customerId",
        as: "customer",
      },
    },
    { $unwind: "$customer" },
    {
      $project: {
        name: 1,
        customerId: 1,
        slots: 1,
        products: 1,
        customer: {
          fullname: 1,
        },
      },
    },
  ]);

  if (!schedules || schedules.length === 0) {
    throw new NotFoundError([
      {
        code: "custom",
        message: "PRODUCTS_NOT_FOUND",
        path: ["productIds"],
      },
    ]);
  }

  return schedules[0];
};
