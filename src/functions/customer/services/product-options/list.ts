import { Schedule, ScheduleProduct } from "~/functions/schedule";
import { CustomerProductServiceGet } from "../product/get";

export type CustomerProductOptionsServiceListProps = {
  customerId: Schedule["customerId"];
  productId: ScheduleProduct["productId"];
};

export const CustomerProductOptionsServiceList = async (
  filter: CustomerProductOptionsServiceListProps
) => {
  const product = await CustomerProductServiceGet(filter);
  return product.options;
};
