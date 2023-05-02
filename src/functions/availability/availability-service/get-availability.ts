import { ProductModel } from "~/functions/product";
import { ProductUsersModel } from "~/functions/product-users/product-users.model";
import { NotFoundError } from "~/library/handler";
import { AvailabilityServiceCreateAvailability } from "./create-availability";
import { AvailabilityServiceGetBookings } from "./get-bookings";
import { AvailabilityServiceGetCarts } from "./get-carts";
import { AvailabilityServiceGetShifts } from "./get-shifts";
import { AvailabilityServiceRemoveAvailability } from "./remove-availability";

export type AvailabilityServiceGetAvailabilityProps = {
  userId?: string;
  productId: number;
  start: Date;
  end: Date;
};

export const AvailabilityServiceGetAvailability = async ({
  userId,
  start,
  end,
  productId,
}: AvailabilityServiceGetAvailabilityProps) => {
  const product = await ProductModel.findOne({
    productId,
  });

  if (!product) {
    throw new NotFoundError([
      { path: ["product"], message: "NOT_FOUND", code: "custom" },
    ]);
  }

  const productUsers = await ProductUsersModel.find({
    productId,
    userId,
  });
  const userIds = productUsers.map(({ userId }) => userId.toString());
  const tag = productUsers.map(({ tag }) => tag);

  const schedules = await AvailabilityServiceGetShifts({
    end,
    userIds,
    start,
    tag,
  });

  console.log(userId, schedules);

  let createdAvailabilities = AvailabilityServiceCreateAvailability(
    product,
    schedules
  );

  console.log(createdAvailabilities);

  const bookings = await AvailabilityServiceGetBookings({
    end,
    userIds,
    start,
  });

  createdAvailabilities = AvailabilityServiceRemoveAvailability(
    createdAvailabilities,
    bookings
  );

  const carts = await AvailabilityServiceGetCarts({
    end,
    userIds,
    start,
  });

  createdAvailabilities = AvailabilityServiceRemoveAvailability(
    createdAvailabilities,
    carts
  );

  return createdAvailabilities;
};
