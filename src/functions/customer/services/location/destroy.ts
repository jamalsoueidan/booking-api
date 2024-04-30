import { LocationModel } from "~/functions/location";
import { StringOrObjectIdType } from "~/library/zod";
import { CustomerProductServiceRemoveLocationFromAll } from "../product/remove-location-from-all";

export type CustomerLocationServiceDestroyProps = {
  locationId: StringOrObjectIdType;
  customerId: number;
};

/*
 * choose another default if the deleted is default?
 */
export const CustomerLocationServiceDestroy = async (
  props: CustomerLocationServiceDestroyProps
) => {
  await CustomerProductServiceRemoveLocationFromAll({
    locationId: props.locationId.toString(),
    customerId: props.customerId,
  });

  return LocationModel.updateOne(
    {
      _id: props.locationId,
      customerId: props.customerId,
    },
    {
      deletedAt: new Date(),
    }
  );
};
