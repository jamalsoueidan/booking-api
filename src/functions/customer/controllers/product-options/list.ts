import { z } from "zod";

import {
  ScheduleProductZodSchema,
  ScheduleZodSchema,
} from "~/functions/schedule/schedule.types";
import { _ } from "~/library/handler";
import { CustomerProductOptionsServiceList } from "../../services/product-options/list";

export type CustomerProductOptionsControllerListRequest = {
  query: z.infer<typeof CustomerProductOptionsControllerListQuerySchema>;
};

const CustomerProductOptionsControllerListQuerySchema = z.object({
  customerId: ScheduleZodSchema.shape.customerId,
  productId: ScheduleProductZodSchema.shape.productId,
});

export const CustomerProductOptionsControllerList = _(
  ({ query }: CustomerProductOptionsControllerListRequest) => {
    const validateQuery =
      CustomerProductOptionsControllerListQuerySchema.parse(query);
    return CustomerProductOptionsServiceList(validateQuery);
  }
);
