import { ScheduleModel } from "~/functions/schedule";

export const CustomerProductServiceRemoveLocationFromAll = async (filter: {
  locationId: string;
  customerId: number;
}) => {
  const schedules = await ScheduleModel.find({ customerId: filter.customerId });

  for (let schedule of schedules) {
    for (let product of schedule.products) {
      product.locations = product.locations.filter(
        (location) =>
          location.location.toString() !== filter.locationId.toString()
      );
    }

    schedule.products = schedule.products.filter((p) => p.locations.length > 0);
    await schedule.save();
  }
};
