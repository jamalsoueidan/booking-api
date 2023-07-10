import { Lookup } from "../lookup";
import { User } from "../user";

export type Availability = {
  date: Date;
  customer: Pick<User, "fullname" | "customerId">;
  lookup?: Lookup;
  slots: {
    from: Date;
    to: Date;
    products: {
      productId: number;
      variantId: number;
      from: Date;
      to: Date;
      breakTime: number;
      duration: number;
    }[];
  }[];
};
