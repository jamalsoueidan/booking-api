import { z } from "zod";
import { UserServiceGetUserIdsbyGroup } from "~/functions/user";
import { ForbiddenError, SessionKey, _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { BookingServiceUpdate } from "../booking.service";
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
  userId: true,
  start: true,
});

export type BookingControllerUpdateResponse = ReturnType<
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
      const { userId } = body;

      if (session.isUser) {
        if (body.userId !== session.userId) {
          throw new ForbiddenError(
            "not allowed to update another user booking"
          );
        }
      } else if (session.isAdmin) {
        const userIds = await UserServiceGetUserIdsbyGroup({
          group: session.group,
        });
        const notFound = !userIds.find((id) => id === userId);
        if (notFound) {
          throw new ForbiddenError("cant update booking in another group");
        }
      }
    }

    const validateQuery = BookingControllerUpdateQuerySchema.parse(query);
    const validateBody = BookingControllerUpdateBodySchema.parse(body);
    return BookingServiceUpdate(validateQuery, validateBody);
  }
);
