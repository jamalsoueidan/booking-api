import { isSameDay } from "date-fns";
import { z } from "zod";
import { _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { isDurationAtLeastOneHour } from "../shift-middleware/shift-refinement";
import { ShiftRestrictUser } from "../shift-middleware/shift-restrictions";
import { ShiftServiceCreate } from "../shift.service";
import { ShiftSchema } from "../shift.types";

export type ShiftControllerCreateRequest = {
  query: ShiftControllerCreateQuery;
  body: ShiftControllerCreateBody;
};

export const ShiftControllerCreateBodySchema = ShiftSchema.pick({
  tag: true,
  start: true,
  end: true,
})
  .refine((data) => isDurationAtLeastOneHour(data.start, data.end), {
    message:
      "Start time must be before end time, and the time distance must be at least 1 hour.",
    path: ["start", "end"],
  })
  .refine((data) => isSameDay(data.start, data.end), {
    message: "Start and end times must be on the same day.",
    path: ["start", "end"],
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

export type ShiftControllerCreateResponse = Awaited<
  ReturnType<typeof ShiftServiceCreate>
>;

export const ShiftControllerCreate = _(
  jwtVerify,
  ShiftRestrictUser,
  ({ query, body }: ShiftControllerCreateRequest) => {
    const validateBody = ShiftControllerCreateBodySchema.parse(body);
    return ShiftServiceCreate(query, validateBody);
  }
);
