import mongoose from "mongoose";
import { z } from "zod";
import { ProductModel } from "./product.model";
import { ProductServiceUpdateBodyZodSchema } from "./product.types";

export type ProductServiceGetAllProps = {
  active?: boolean;
};

export const ProductServiceGetAll = (filter: ProductServiceGetAllProps) => {
  return ProductModel.find(filter);
};

export type ProductServiceGetByIdProps = {
  id?: string;
  productId?: number;
};

export const ProductServiceGetById = async ({
  id,
  productId,
}: ProductServiceGetByIdProps) => {
  return ProductModel.findOne({
    ...(id ? { _id: new mongoose.Types.ObjectId(id) } : null),
    ...(productId ? { productId } : null),
  });
};

export const ProductServiceUpdate = async (
  id: string,
  body: Partial<z.infer<typeof ProductServiceUpdateBodyZodSchema>>
) => {
  return ProductModel.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(id),
    },
    {
      $set: body,
    },
    {
      new: true,
    }
  );
};
