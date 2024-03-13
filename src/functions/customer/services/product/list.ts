import { Schedule, ScheduleModel } from "~/functions/schedule";

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
