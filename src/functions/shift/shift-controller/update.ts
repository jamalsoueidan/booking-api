import { z } from "zod";
import { _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { ShiftRestrictUser } from "../shift-middleware/shift-restrictions";
import { ShiftServiceUpdate } from "../shift.service";
import { Shift, ShiftSchema } from "../shift.types";

export type ShiftControllerUpdateRequest = {
  query: ShiftControllerUpdateQuery;
  body: ShiftControllerUpdateBody;
};

export const ShiftControllerUpdateBodySchema = ShiftSchema.pick({
  tag: true,
  start: true,
  end: true,
});

export type ShiftControllerUpdateBody = z.infer<
  typeof ShiftControllerUpdateBodySchema
>;

export const ShiftControllerUpdateQuerySchema = ShiftSchema.pick({
  _id: true,
  userId: true,
});

export type ShiftControllerUpdateQuery = z.infer<
  typeof ShiftControllerUpdateQuerySchema
>;

export type ShiftControllerUpdateResponse = Array<Shift>;

export const ShiftControllerUpdate = _(
  jwtVerify,
  ShiftRestrictUser,
  async ({ query, body }: ShiftControllerUpdateRequest) => {
    const validateQuery = ShiftControllerUpdateQuerySchema.parse(query);
    const validateBody = ShiftControllerUpdateBodySchema.parse(body);
    return ShiftServiceUpdate(validateQuery, validateBody);
  }
);
