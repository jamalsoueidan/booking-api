import { Schedule, ScheduleModel, ScheduleProduct } from "~/functions/schedule";

export type CustomerProductServiceDestroyFilter = {
  customerId: Schedule["customerId"];
  productId: ScheduleProduct["productId"];
};

export const CustomerProductServiceDestroy = async (
  filter: CustomerProductServiceDestroyFilter
) => {
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
  );
};
