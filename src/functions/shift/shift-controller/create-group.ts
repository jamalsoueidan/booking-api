import { z } from "zod";
import { _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { isDurationAtLeastOneHour } from "../shift-middleware/shift-refinement";
import { ShiftRestrictUser } from "../shift-middleware/shift-restrictions";
import { ShiftServiceCreateGroup } from "../shift.service";
import { Shift, ShiftDaysSchema, ShiftSchema } from "../shift.types";

export type ShiftControllerCreateGroupRequest = {
  query: ShiftControllerCreateGroupQuery;
  body: ShiftControllerCreateGroupBody;
};

export const ShiftControllerCreateGroupBodySchema = ShiftSchema.pick({
  tag: true,
  start: true,
  end: true,
})
  .extend({
    days: ShiftDaysSchema,
  })
  .refine((data) => isDurationAtLeastOneHour(data.start, data.end), {
    message:
      "Start time must be before end time, and the time distance must be at least 1 hour.",
    path: ["start", "end"],
  });

export type ShiftControllerCreateGroupBody = z.infer<
  typeof ShiftControllerCreateGroupBodySchema
>;

export const ShiftControllerCreateGroupQuerySchema = ShiftSchema.pick({
  userId: true,
});

export type ShiftControllerCreateGroupQuery = z.infer<
  typeof ShiftControllerCreateGroupQuerySchema
>;

export type ShiftControllerCreateGroupResponse = Array<Omit<Shift, "_id">>;

export const ShiftControllerCreateGroup = _(
  jwtVerify,
  ShiftRestrictUser,
  ({
    query,
    body,
  }: ShiftControllerCreateGroupRequest): Promise<ShiftControllerCreateGroupResponse> => {
    const validateBody = ShiftControllerCreateGroupBodySchema.parse(body);
    return ShiftServiceCreateGroup(query, validateBody);
  }
);
