import { z } from "zod";
import { UserServiceBelongsToSameGroup } from "~/functions/user";
import { SessionKey, _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { ShiftServiceGetAll } from "../shift.service";
import { Shift, ShiftSchema } from "../shift.types";

export type ShiftControllerGetAllRequest = {
  query: ShiftControllerGetAllQuery;
};

export const ShiftControllerGetAllSchema = ShiftSchema.pick({
  userId: true,
  start: true,
  end: true,
});

export type ShiftControllerGetAllQuery = z.infer<
  typeof ShiftControllerGetAllSchema
>;

export type ShiftControllerGetAllResponse = Array<Shift>;

export const ShiftControllerGetAll = _(
  jwtVerify,
  async ({ query, session }: SessionKey<ShiftControllerGetAllRequest>) => {
    const { end, userId, start } = ShiftControllerGetAllSchema.parse(query);
    if (!session.isOwner) {
      const belongToSameGroup = await UserServiceBelongsToSameGroup({
        userId,
        group: session.group,
      });
      if (!belongToSameGroup) {
        throw { access: "not allowed to modifiy staff in other groups" };
      }
    }
    return ShiftServiceGetAll({ end, userId, start });
  }
);
