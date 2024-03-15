import { LocationModel } from "~/functions/location";

export type CustomerLocationServiceListProps = {
  customerId: number;
};

export const CustomerLocationServiceList = (
  props: CustomerLocationServiceListProps
) => {
  return LocationModel.find({ customerId: props.customerId, deletedAt: null });
};
