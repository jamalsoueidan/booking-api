import { BlockedModel } from "~/functions/blocked/blocked.model";
import { Blocked } from "~/functions/blocked/blocked.types";

export const CustomerBlockedServiceCreate = (props: Blocked) => {
  const created = new BlockedModel(props);
  return created.save();
};
