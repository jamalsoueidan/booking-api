import { LocationModel } from "~/functions/location";
import { NotFoundError } from "~/library/handler";

export type CustomerLocationServiceListProps = {
  customerId: number;
};

export const CustomerLocationServiceList = (
  props: CustomerLocationServiceListProps
) => {
  return LocationModel.find({
    customerId: props.customerId,
    deletedAt: null,
  }).orFail(
    new NotFoundError([
      {
        path: ["locationId", "customerId"],
        message: "LOCATION_NOT_FOUND_IN_USER",
        code: "custom",
      },
    ])
  );
};
