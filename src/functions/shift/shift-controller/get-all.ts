import { z } from "zod";
import { _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { ShiftRestrictGroup } from "../shift-middleware/shift-restrictions";
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
  ShiftRestrictGroup,
  async ({ query }: ShiftControllerGetAllRequest) => {
    // validate the start and end is only one month range!
    const { end, userId, start } = ShiftControllerGetAllSchema.parse(query);
    return ShiftServiceGetAll({ end, userId, start });
  }
);
