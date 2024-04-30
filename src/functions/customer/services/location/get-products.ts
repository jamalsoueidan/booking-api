import mongoose from "mongoose";
import { ScheduleModel } from "~/functions/schedule";
import { NumberOrStringType, StringOrObjectId } from "~/library/zod";

export type CustomerLocationServiceGetProductsProps = {
  customerId: NumberOrStringType;
  locationId: StringOrObjectId;
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
