import { Cart, CartModel } from "~/functions/cart";

export type GetCartsByUserierProps = Omit<Cart, "createdAt" | "userId"> & {
  userIds: string[];
};

export const AvailabilityServiceGetCarts = ({
  userIds,
  start,
  end,
}: GetCartsByUserierProps) => {
  return CartModel.aggregate<Cart>([
    {
      $match: {
        $or: [
          {
            start: {
              $gte: start,
            },
          },
          {
            end: {
              $gte: start,
            },
          },
        ],
        userId: {
          $in: userIds,
        },
      },
    },
    {
      $match: {
        $or: [
          {
            start: {
              $lt: end,
            },
          },
          {
            end: {
              $lt: end,
            },
          },
        ],
      },
    },
  ]);
};
