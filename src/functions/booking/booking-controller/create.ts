import { z } from "zod";
import { UserServiceGetUserIdsbyGroup } from "~/functions/user";
import { ForbiddenError, SessionKey, _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { BookingServiceCreate } from "../booking.service";
import { BookingZodSchema } from "./../booking.types";

export type BookingControllerCreateRequest = {
  body: z.infer<typeof BookingControllerCreateZodSchema>;
};

export const BookingControllerCreateZodSchema = BookingZodSchema.pick({
  customerId: true,
  end: true,
  productId: true,
  userId: true,
  start: true,
});

export type BookingControllerCreateResponse = ReturnType<
  typeof BookingControllerCreate
>;

export const BookingControllerCreate = _(
  jwtVerify,
  async ({ body, session }: SessionKey<BookingControllerCreateRequest>) => {
    if (!session.isOwner) {
      const { userId } = body;

      // user can only create for self self
      if (session.isUser) {
        if (userId !== session.userId) {
          throw new ForbiddenError("You can't create booking for another user");
        }
      } else if (session.isAdmin) {
        const allStaff = await UserServiceGetUserIdsbyGroup({
          group: session.group,
        });
        const notFound = !allStaff.find((s) => s === userId);
        if (notFound) {
          throw new ForbiddenError("You can't create booking in another group");
        }
      }
    }

    const validate = BookingControllerCreateZodSchema.parse(body);
    return BookingServiceCreate(validate);
  }
);
