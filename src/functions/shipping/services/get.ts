import mongoose from "mongoose";
import { NotFoundError } from "~/library/handler";
import { StringOrObjectId } from "~/library/zod";
import { ShippingModel } from "../shipping.model";

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
