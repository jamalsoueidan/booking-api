import { BlockedModel } from "~/functions/blocked/blocked.model";

export type CustomerBlockedServiceRangeProps = {
  customerId: number;
  start: string | Date;
  end: string | Date;
};

export type CustomerBlockedServiceRangeAggregate = {
  start: Date;
  end: Date;
  title: string;
};

export const CustomerBlockedServiceRange = async ({
  customerId,
  start: startDate,
  end: endDate,
}: CustomerBlockedServiceRangeProps) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return BlockedModel.aggregate<CustomerBlockedServiceRangeAggregate>([
    {
      $match: {
        $and: [
          {
            customerId,
          },
          {
            $or: [
              {
                start: {
                  $gte: start,
                  $lte: end,
                },
              },
              {
                end: {
                  $gte: start,
                  $lte: end,
                },
              },
            ],
          },
        ],
      },
    },
  ]);
};
