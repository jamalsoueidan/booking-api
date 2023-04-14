import {
  IProductDocument,
  ProductServiceGetById,
  ProductServiceUpdate,
} from "~/functions/product";
import { Tag } from "~/functions/shift";
import { createUserWithShift } from "./shift";
import { DEFAULT_GROUP } from "./user";

interface createUserWithShiftAndUpdateProductProps {
  product: IProductDocument;
  tag: Tag;
  group?: string;
}

export const createUserWithShiftAndUpdateProduct = async ({
  product,
  tag,
  group = DEFAULT_GROUP,
}: createUserWithShiftAndUpdateProductProps) => {
  const { user, shift } = await createUserWithShift({
    group,
    tag,
  });

  await ProductServiceUpdate(product._id, {
    users: [{ userId: user._id, tag }],
  });

  const updatedProduct = await ProductServiceGetById({ id: product.id });

  return { user, shift, updatedProduct };
};
