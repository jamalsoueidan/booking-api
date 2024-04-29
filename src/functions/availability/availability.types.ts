import { ScheduleProduct } from "../schedule";
import { Shipping } from "../shipping/shipping.types";
import { User } from "../user/user.types";

export type AvailabilityProducts = Array<
  Pick<
    ScheduleProduct,
    "productId" | "variantId" | "breakTime" | "duration"
  > & {
    from: Date;
    to: Date;
    parentId?: number;
  }
>;

export type Availability = {
  date: Date;
  customer: Pick<User, "fullname" | "customerId">;
  shipping?: Shipping;
  slots: Array<{
    from: Date;
    to: Date;
    products: AvailabilityProducts;
  }>;
};
