import { NotFoundError } from "~/library/handler";
import { AvailabilityServiceCreateAvailability } from "./create-availability";
import { AvailabilityServiceGetBookings } from "./get-bookings";
import { AvailabilityServiceGetCarts } from "./get-carts";
import { AvailabilityServiceGetProduct } from "./get-product";
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
  const product = await AvailabilityServiceGetProduct({
    productId,
    userId,
  });

  if (!product) {
    throw new NotFoundError("product not found");
  }

  const userIds = product.users.map((s) => s.userId);
  const tag = product.users.map((s) => s.tag);

  const schedules = await AvailabilityServiceGetShifts({
    end,
    userIds,
    start,
    tag,
  });

  let createdAvailabilities = AvailabilityServiceCreateAvailability(
    product,
    schedules
  );

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
