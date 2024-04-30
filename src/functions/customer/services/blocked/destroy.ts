import { BlockedModel } from "~/functions/blocked/blocked.model";
import { StringOrObjectIdType } from "~/library/zod";

export type CustomerBlockedServiceDestroyProps = {
  blockedId: StringOrObjectIdType;
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
