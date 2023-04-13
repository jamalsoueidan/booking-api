import { z } from "zod";
import { UserServiceGetUserIdsbyGroup } from "~/functions/user";
import { SessionKey, _ } from "~/library/handler";
import { objectIdIsValid } from "~/library/handler/validate";
import { jwtVerify } from "~/library/jwt";
import { BookingServiceGetAll } from "../booking.service";
import { BookingZodSchema } from "../booking.types";

export type BookingControllerGetAllRequest = {
  query: z.infer<typeof BookingControllerGetAllQuerySchema>;
};

export const BookingControllerGetAllQuerySchema = BookingZodSchema.pick({
  end: true,
  start: true,
}).extend({
  userId: z
    .union([objectIdIsValid("userId"), z.array(objectIdIsValid("userId"))])
    .optional(),
});

export type BookingControllerGetAllResponse = ReturnType<
  typeof BookingServiceGetAll
>;

export const BookingControllerGetAll = _(
  jwtVerify,
  async ({ query, session }: SessionKey<BookingControllerGetAllRequest>) => {
    if (!session.isOwner) {
      query.userId = await UserServiceGetUserIdsbyGroup({
        group: session.group,
      });
    }

    const validate = BookingControllerGetAllQuerySchema.parse(query);
    return BookingServiceGetAll(validate);
  }
);
