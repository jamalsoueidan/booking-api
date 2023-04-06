import { z } from "zod";
import { _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { ShiftRestrictUser } from "../shift-middleware/shift-restrictions";
import { ShiftServiceDestroyGroup } from "../shift.service";
import { Shift, ShiftSchema } from "../shift.types";

export type ShiftControllerDestroyGroupRequest = {
  query: ShiftControllerDestroyGroupQuery;
};

export const ShiftControllerDestroyGroupQuerySchema = ShiftSchema.pick({
  userId: true,
}).extend({
  groupId: z.string(),
});

export type ShiftControllerDestroyGroupQuery = z.infer<
  typeof ShiftControllerDestroyGroupQuerySchema
>;

export type ShiftControllerDestroyGroupResponse = Array<Omit<Shift, "_id">>;

export const ShiftControllerDestroyGroup = _(
  jwtVerify,
  ShiftRestrictUser,
  async ({ query }: ShiftControllerDestroyGroupRequest) => {
    const validateQuery = ShiftControllerDestroyGroupQuerySchema.parse(query);
    return ShiftServiceDestroyGroup(validateQuery);
  }
);
