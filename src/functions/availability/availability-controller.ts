import { z } from "zod";
import { ProductZodSchema } from "~/functions/product";
import { SettingModel } from "~/functions/setting";
import { _ } from "~/library/handler";
import { ResolveReturnType } from "~/types";
import { ShiftSchema } from "../shift";
import {
  AvailabilityServiceGetAvailability,
  AvailabilityServiceGetUsers,
} from "./availability-service";

export type AvailabilityControllerGetUsersRequest = {
  query: AvailabilityControllerGetUsersQuery;
};

export type AvailabilityControllerGetUsersResponse = ResolveReturnType<
  typeof AvailabilityServiceGetUsers
>;

export const AvailabilityControllerGetUsersSchema = ProductZodSchema.pick({
  productId: true,
});

export type AvailabilityControllerGetUsersQuery = z.infer<
  typeof AvailabilityControllerGetUsersSchema
>;

export const AvailabilityControllerGetUsers = _(
  async ({ query }: AvailabilityControllerGetUsersRequest) => {
    const validate = AvailabilityControllerGetUsersSchema.parse(query);
    return AvailabilityServiceGetUsers(validate);
  }
);

export type AvailabilityControllerGetAvailabilityRequest = {
  query: AvailabilityControllerGetAvailabilityQuery;
};

export type AvailabilityControllerGetAvailabilityResponse = ResolveReturnType<
  typeof AvailabilityServiceGetAvailability
>;

export const AvailabilityControllerGetAvailabilitySchema =
  ProductZodSchema.pick({
    productId: true,
  })
    .merge(ShiftSchema.pick({ start: true, end: true }))
    .extend({ userId: z.string().optional() });

export type AvailabilityControllerGetAvailabilityQuery = z.infer<
  typeof AvailabilityControllerGetAvailabilitySchema
>;

export const AvailabilityControllerGetAvailability = _(
  async ({ query }: AvailabilityControllerGetAvailabilityRequest) => {
    const validate = AvailabilityControllerGetAvailabilitySchema.parse(query);
    return AvailabilityServiceGetAvailability(validate);
  }
);

export const AvailabilityControllerGetSettings = _(async () => {
  return SettingModel.findOne({}, "language status timeZone");
});
