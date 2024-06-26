import mongoose from "mongoose";
import { ShippingModel } from "~/functions/shipping/shipping.model";
import { NotFoundError } from "~/library/handler";
import { StringOrObjectIdType } from "~/library/zod";

export type ShippingServiceGetProps = {
  shippingId: StringOrObjectIdType;
};

export const ShippingServiceGet = ({ shippingId }: ShippingServiceGetProps) => {
  return ShippingModel.findOne(new mongoose.Types.ObjectId(shippingId))
    .orFail(
      new NotFoundError([
        {
          code: "custom",
          message: "SHIPPING_NOT_FOUND",
          path: ["shippingId"],
        },
      ])
    )
    .lean();
};
