import { z } from "zod";
import { UserServiceGetUserIdsbyGroup } from "~/functions/user";
import { ForbiddenError, SessionKey, _ } from "~/library/handler";
import { objectIdIsValid } from "~/library/handler/validate";
import { jwtVerify } from "~/library/jwt";
import { ResolveReturnType } from "~/types";
import {
  BookingServiceGetUserId,
  BookingServiceUpdate,
} from "../booking.service";
import { BookingZodSchema } from "../booking.types";

export type BookingControllerUpdateRequest = {
  query: z.infer<typeof BookingControllerUpdateQuerySchema>;
  body: z.infer<typeof BookingControllerUpdateBodySchema>;
};

export const BookingControllerUpdateQuerySchema = BookingZodSchema.pick({
  _id: true,
});

export const BookingControllerUpdateBodySchema = BookingZodSchema.pick({
  end: true,
  start: true,
}).extend({
  userId: objectIdIsValid("userId").optional(),
});

export type BookingControllerUpdateResponse = ResolveReturnType<
  typeof BookingServiceUpdate
>;

export const BookingControllerUpdate = _(
  jwtVerify,
  async ({
    query,
    body,
    session,
  }: SessionKey<BookingControllerUpdateRequest>) => {
    if (!session.isOwner) {
      const booking = await BookingServiceGetUserId(query._id);
      if (session.isUser) {
        if (booking?.userId.toString() !== session.userId) {
          throw new ForbiddenError(
            "not allowed to update booking for other users"
          );
        }
      }

      if (session.isAdmin) {
        const { userId } = body;
        const userIds = await UserServiceGetUserIdsbyGroup({
          group: session.group,
        });

        const currentBookingBelongsSameGroup = userIds.includes(
          booking?.userId.toString() || ""
        );

        if (!currentBookingBelongsSameGroup) {
          throw new ForbiddenError(
            "not allowed to update booking outside your group"
          );
        }

        const updateBookingBelongsSameGroup = userIds.includes(
          userId?.toString() || ""
        );

        if (!updateBookingBelongsSameGroup) {
          throw new ForbiddenError(
            "can't update booking for user another group"
          );
        }
      }
    }

    const validateQuery = BookingControllerUpdateQuerySchema.parse(query);
    const validateBody = BookingControllerUpdateBodySchema.parse(body);
    return BookingServiceUpdate(validateQuery, validateBody);
  }
);
