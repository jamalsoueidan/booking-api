import { z } from "zod";
import { _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { ShiftRestrictUser } from "../shift-middleware/shift-restrictions";
import { ShiftServiceUpdate } from "../shift.service";
import { Shift, ShiftSchema } from "../shift.types";
import { ShiftControllerCreateBodySchema } from "./create";

export type ShiftControllerUpdateRequest = {
  query: ShiftControllerUpdateQuery;
  body: ShiftControllerUpdateBody;
};

export type ShiftControllerUpdateBody = z.infer<
  typeof ShiftControllerCreateBodySchema
>;

export const ShiftControllerUpdateQuerySchema = ShiftSchema.pick({
  _id: true,
  userId: true,
});

export type ShiftControllerUpdateQuery = z.infer<
  typeof ShiftControllerUpdateQuerySchema
>;

export type ShiftControllerUpdateResponse = Shift;

export const ShiftControllerUpdate = _(
  jwtVerify,
  ShiftRestrictUser,
  async ({ query, body }: ShiftControllerUpdateRequest) => {
    const validateQuery = ShiftControllerUpdateQuerySchema.parse(query);
    const validateBody = ShiftControllerCreateBodySchema.parse(body);
    return ShiftServiceUpdate(validateQuery, validateBody);
  }
);
