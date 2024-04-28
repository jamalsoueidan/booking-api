import { Schedule, ScheduleModel, ScheduleProduct } from "~/functions/schedule";
import { User } from "~/functions/user";
import { NotFoundError } from "~/library/handler";

export type UserScheduleServiceGetWithCustomerProps = {
  customerId: number;
  productIds: Array<ScheduleProduct["productId"]>;
};

export type UserScheduleServiceGetWithCustomerResponse = Omit<
  Schedule,
  "products"
> & {
  customer: Pick<User, "fullname">;
  products: Array<
    Pick<
      ScheduleProduct,
      | "duration"
      | "productId"
      | "variantId"
      | "options"
      | "breakTime"
      | "price"
      | "noticePeriod"
      | "bookingPeriod"
    >
  >;
};

export const UserScheduleServiceGetWithCustomer = async (
  props: UserScheduleServiceGetWithCustomerProps
) => {
  const schedules =
    await ScheduleModel.aggregate<UserScheduleServiceGetWithCustomerResponse>([
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
