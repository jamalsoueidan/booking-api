import { z } from "zod";
import { _ } from "~/library/handler";
import { NumberOrString } from "~/library/zod";
import { CustomerBookingServiceGetByGroup } from "../../services/booking/get-by-group";

export type CustomerBookingControllerGetByGroupRequest = {
  query: z.infer<typeof CustomerBookingControllerGetByGroupSchema>;
};

export const CustomerBookingControllerGetByGroupSchema = z.object({
  customerId: NumberOrString,
  orderId: NumberOrString,
  groupId: z.string(),
});

export type CustomerBookingControllerGetByGroupResponse = Awaited<
  ReturnType<typeof CustomerBookingServiceGetByGroup>
>;

export const CustomerBookingControllerGetByGroup = _(
  async ({ query }: CustomerBookingControllerGetByGroupRequest) => {
    const validateData = CustomerBookingControllerGetByGroupSchema.parse(query);
    return CustomerBookingServiceGetByGroup(validateData);
  }
);
