import mongoose from "mongoose";
import { ShippingModel } from "~/functions/shipping/shipping.model";
import { NotFoundError } from "~/library/handler";
import { StringOrObjectId } from "~/library/zod";

export type ShippingServiceGetProps = {
  shippingId: StringOrObjectId;
};

export const ShippingServiceGet = async ({
  shippingId,
}: ShippingServiceGetProps) => {
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
