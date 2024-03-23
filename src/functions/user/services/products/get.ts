import { ScheduleModel } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";
import { UserServiceGetCustomerId } from "../user/get-customer-id";

export type UserProductServiceGetFilter = {
  username: string;
  productHandle: string;
};

export const UserProductServiceGet = async (
  filter: UserProductServiceGetFilter
) => {
  const user = await UserServiceGetCustomerId({
    username: filter.username,
  });

  const schedule = await ScheduleModel.findOne({
    customerId: user.customerId,
    products: {
      $elemMatch: {
        productHandle: filter.productHandle,
      },
    },
  })
    .orFail(
      new NotFoundError([
        {
          code: "custom",
          message: "PRODUCT_NOT_FOUND",
          path: ["customerId", "productHandle"],
        },
      ])
    )
    .lean();

  const product = schedule.products.find(
    (p) => p.productHandle === filter.productHandle
  );

  if (!product) {
    throw new NotFoundError([
      {
        code: "custom",
        message: "PRODUCT_NOT_FOUND",
        path: ["productHandle"],
      },
    ]);
  }

  return {
    ...product,
    scheduleId: schedule._id,
    scheduleName: schedule.name,
  };
};
