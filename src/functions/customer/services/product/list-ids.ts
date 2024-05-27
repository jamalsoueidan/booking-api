import { Schedule, ScheduleModel } from "~/functions/schedule";

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
