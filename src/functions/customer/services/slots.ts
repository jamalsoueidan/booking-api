import { Schedule, ScheduleModel, ScheduleSlot } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";
import { shopifyAdmin } from "~/library/shopify";
import { UPDATE_SCHEDULE_METAOBJECT } from "./schedule/update";

export type CustomerScheduleSlotServiceUpdateFilter = {
  scheduleId: Schedule["_id"];
  customerId: Schedule["customerId"];
};

export type CustomerScheduleSlotServiceUpdateBody = ScheduleSlot[];

export const CustomerScheduleSlotServiceUpdate = async (
  filter: CustomerScheduleSlotServiceUpdateFilter,
  updatedSlot: CustomerScheduleSlotServiceUpdateBody
) => {
  const schedule = await ScheduleModel.findOne({
    _id: filter.scheduleId,
    customerId: filter.customerId,
  }).orFail(
    new NotFoundError([
      {
        code: "custom",
        message: "SCHEDULE_NOT_FOUND",
        path: ["schedule"],
      },
    ])
  );

  const data = await schedule.updateSlots(updatedSlot);

  if (schedule.metafieldId) {
    await shopifyAdmin.request(UPDATE_SCHEDULE_METAOBJECT, {
      variables: {
        id: schedule.metafieldId,
        fields: [
          {
            key: "slots",
            value: JSON.stringify(data.slots),
          },
        ],
      },
    });
  }

  return data;
};
