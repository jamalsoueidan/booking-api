import mongoose from "mongoose";
import { ScheduleModel } from "~/functions/schedule";
import { NumberOrStringType, StringOrObjectIdType } from "~/library/zod";

export type CustomerLocationServiceGetProductsProps = {
  customerId: NumberOrStringType;
  locationId: StringOrObjectIdType;
};

export const CustomerLocationServiceGetProducts = async ({
  customerId,
  locationId,
}: CustomerLocationServiceGetProductsProps) => {
  return ScheduleModel.aggregate([
    {
      $match: {
        customerId,
      },
    },
    {
      $unwind: "$products",
    },
    {
      $match: {
        "products.locations.location": new mongoose.Types.ObjectId(locationId),
      },
    },
    {
      $replaceRoot: {
        newRoot: "$products",
      },
    },
  ]);
};
