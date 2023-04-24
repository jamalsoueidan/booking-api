import { z } from "zod";
import { _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { ShiftRestrictUser } from "../shift-middleware/shift-restrictions";
import { ShiftServiceGetById } from "../shift.service";
import { ShiftSchema } from "../shift.types";

export type ShiftControllerGetByIdRequest = {
  query: ShiftControllerGetByIdQuery;
};

export const ShiftControllerGetByIdSchema = ShiftSchema.pick({
  _id: true,
  userId: true,
});

export type ShiftControllerGetByIdQuery = z.infer<
  typeof ShiftControllerGetByIdSchema
>;

export type ShiftControllerGetByIdResponse = Awaited<
  ReturnType<typeof ShiftServiceGetById>
>;

export const ShiftControllerGetById = _(
  jwtVerify,
  ShiftRestrictUser,
  async ({ query }: ShiftControllerGetByIdRequest) => {
    const validateQuery = ShiftControllerGetByIdSchema.parse(query);
    return ShiftServiceGetById(validateQuery);
  }
);
