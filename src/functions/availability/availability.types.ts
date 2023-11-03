import { Shipping } from "../shipping/shipping.types";
import { User } from "../user/user.types";

export type Availability = {
  date: Date;
  customer: Pick<User, "fullname" | "customerId">;
  shipping?: Shipping;
  slots: {
    from: Date;
    to: Date;
    products: {
      productId: number;
      variantId: number;
      from: Date;
      ["to"]: any;
      breakTime: number;
      duration: number;
    }[];
  }[];
};
