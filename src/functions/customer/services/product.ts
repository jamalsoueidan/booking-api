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

type CustomerProductsServiceListProps = {
  customerId: Schedule["customerId"];
};

export const CustomerProductsServiceList = async (
  filter: CustomerProductsServiceListProps
) => {
  const schedules = await ScheduleModel.find(filter)
    .select("name products")
    .lean();

  return schedules.flatMap((schedule) =>
    schedule.products.map((product) => ({
      _id: schedule._id,
      name: schedule.name,
      ...product,
    }))
  );
};
