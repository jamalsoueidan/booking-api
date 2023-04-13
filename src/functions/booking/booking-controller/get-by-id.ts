import { z } from "zod";
import { UserServiceGetUserIdsbyGroup } from "~/functions/user";
import { NotFoundError, SessionKey, _ } from "~/library/handler";
import { objectIdIsValid } from "~/library/handler/validate";
import { jwtVerify } from "~/library/jwt";
import { BookingServiceGetById } from "../booking.service";
import { BookingZodSchema } from "../booking.types";

export type BookingControllerGetByIdRequest = {
  query: z.infer<typeof BookingControllerGetByIdQuerySchema>;
};

export const BookingControllerGetByIdQuerySchema = BookingZodSchema.pick({
  _id: true,
}).extend({
  userId: z
    .union([objectIdIsValid("userId"), z.array(objectIdIsValid("userId"))])
    .optional(),
});

export type BookingControllerGetByIdResponse = ReturnType<
  typeof BookingServiceGetById
>;

export const BookingControllerGetById = _(
  jwtVerify,
  async ({ query, session }: SessionKey<BookingControllerGetByIdRequest>) => {
    if (!session.isOwner) {
      query.userId = await UserServiceGetUserIdsbyGroup({
        group: session.group,
      });
    }
    const validate = BookingControllerGetByIdQuerySchema.parse(query);
    const booking = await BookingServiceGetById(validate);
    if (!booking) {
      throw new NotFoundError("booking not exist");
    }
    return booking;
  }
);
