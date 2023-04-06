import { z } from "zod";
import { _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { ShiftRestrictUser } from "../shift-middleware/shift-restrictions";
import { ShiftServiceCreate } from "../shift.service";
import { Shift, ShiftSchema } from "../shift.types";

export type ShiftControllerCreateRequest = {
  query: ShiftControllerCreateQuery;
  body: ShiftControllerCreateBody;
};

export const ShiftControllerCreateBodySchema = ShiftSchema.pick({
  tag: true,
  start: true,
  end: true,
});

export type ShiftControllerCreateBody = z.infer<
  typeof ShiftControllerCreateBodySchema
>;

export const ShiftControllerCreateQuerySchema = ShiftSchema.pick({
  userId: true,
});

export type ShiftControllerCreateQuery = z.infer<
  typeof ShiftControllerCreateQuerySchema
>;

export type ShiftControllerCreateResponse = Shift;

export const ShiftControllerCreate = _(
  jwtVerify,
  ShiftRestrictUser,
  ({ query, body }: ShiftControllerCreateRequest) => {
    const validateBody = ShiftControllerCreateBodySchema.parse(body);
    return ShiftServiceCreate(query, validateBody);
  }
);
