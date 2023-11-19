import { z } from "zod";
import { _ } from "~/library/handler";
import { StringOrObjectIdType } from "~/library/zod";
import { UserLocationServiceGetOne } from "../../services/location";

export type UserLocationControllerGetOneRequest = {
  query: z.infer<typeof LocationServiceGetOneQuerySchema>;
};

export const LocationServiceGetOneQuerySchema = z.object({
  locationId: StringOrObjectIdType,
  username: z.string(),
});

export type UserLocationControllerGetOneResponse = Awaited<
  ReturnType<typeof UserLocationServiceGetOne>
>;

export const UserLocationControllerGetOne = _(
  ({ query }: UserLocationControllerGetOneRequest) => {
    const validateData = LocationServiceGetOneQuerySchema.parse(query);
    return UserLocationServiceGetOne(validateData);
  }
);
