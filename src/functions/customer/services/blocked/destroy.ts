import { BlockedModel } from "~/functions/blocked/blocked.model";
import { StringOrObjectId } from "~/library/zod";

export type CustomerBlockedServiceDestroyProps = {
  blockedId: StringOrObjectId;
  customerId: number;
};

export const CustomerBlockedServiceDestroy = ({
  blockedId,
  customerId,
}: CustomerBlockedServiceDestroyProps) => {
  return BlockedModel.deleteOne({
    _id: blockedId,
    customerId,
  });
};
