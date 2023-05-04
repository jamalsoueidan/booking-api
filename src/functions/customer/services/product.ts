import { Schedule, ScheduleModel } from "~/functions/schedule";

type CustomerProductsServiceGetProps = {
  customerId: Schedule["customerId"];
};

export const CustomerProductsServiceGet = async (
  filter: CustomerProductsServiceGetProps
) => {
  const schedules = await ScheduleModel.find(filter).select(
    "products.productId"
  );

  const productIds = schedules.flatMap((schedule) => {
    return schedule.products.map((product) => product.productId);
  });

  return productIds;
};
