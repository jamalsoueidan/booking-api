import { BlockedModel } from "~/functions/blocked/blocked.model";

export type CustomerBlockedServiceListProps = {
  customerId: number;
  start: string | Date;
  end: string | Date;
};

export type CustomerBlockedServiceListAggregate = {
  start: Date;
  end: Date;
};

export const CustomerBlockedServiceList = async ({
  customerId,
  start: startDate,
  end: endDate,
}: CustomerBlockedServiceListProps) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return BlockedModel.aggregate<CustomerBlockedServiceListAggregate>([
    {
      $match: {
        customerId,
      },
    },
  ]);
};
