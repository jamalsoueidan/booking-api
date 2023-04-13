export interface Cart {
  cartId?: string;
  userId: string;
  start: Date;
  end: Date;
  createdAt: Date;
}
export type CartGetByStaff = Pick<Cart, "start" | "end" | "userId">;
