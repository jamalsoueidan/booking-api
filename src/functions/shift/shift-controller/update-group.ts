import { z } from "zod";
import { _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { ShiftRestrictUser } from "../shift-middleware/shift-restrictions";
import {
  ShiftServiceCreateGroup,
  ShiftServiceDestroyGroup,
} from "../shift.service";
import { Shift } from "../shift.types";
import {
  ShiftControllerCreateGroupBody,
  ShiftControllerCreateGroupBodySchema,
} from "./create-group";
import { ShiftControllerDestroyGroupQuerySchema } from "./destroy-group";

export type ShiftControllerUpdateGroupRequest = {
  query: ShiftControllerUpdateGroupQuery;
  body: ShiftControllerCreateGroupBody;
};

export type ShiftControllerUpdateGroupQuery = z.infer<
  typeof ShiftControllerDestroyGroupQuerySchema
>;

export type ShiftControllerUpdateGroupResponse = Array<Shift>;

export const ShiftControllerUpdateGroup = _(
  jwtVerify,
  ShiftRestrictUser,
  async ({ query, body }: ShiftControllerUpdateGroupRequest) => {
    const validateQuery = ShiftControllerDestroyGroupQuerySchema.parse(query);
    await ShiftServiceDestroyGroup(validateQuery);
    const validateBody = ShiftControllerCreateGroupBodySchema.parse(body);
    // validated that the tag is the same used as before!
    return ShiftServiceCreateGroup(validateQuery, validateBody);
  }
);
