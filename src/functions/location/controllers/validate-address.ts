import { z } from "zod";
import { _ } from "~/library/handler";
import { LocationZodSchema } from "../location.types";
import { LocationServiceValidateAddress } from "../services/location.service";

export type LocationControllerValidateAddressRequest = {
  query: z.infer<typeof LocationServiceValidateAddressSchema>;
};

export const LocationServiceValidateAddressSchema = LocationZodSchema.pick({
  name: true,
  fullAddress: true,
});

export type LocationControllerValidateAddressResponse = Awaited<
  ReturnType<typeof LocationServiceValidateAddress>
>;

export const LocationControllerValidateAddress = _(
  ({ query }: LocationControllerValidateAddressRequest) => {
    const validateData = LocationServiceValidateAddressSchema.parse(query);
    return LocationServiceValidateAddress(validateData);
  }
);
