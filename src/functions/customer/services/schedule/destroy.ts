import { Schedule, ScheduleModel } from "~/functions/schedule";
import { shopifyAdmin } from "~/library/shopify";

export type CustomerScheduleServiceDestroyProps = {
  scheduleId: Schedule["_id"];
  customerId: Schedule["customerId"];
};

export const CustomerScheduleServiceDestroy = async (
  props: CustomerScheduleServiceDestroyProps
) => {
  const schedule = await ScheduleModel.findOne({
    _id: props.scheduleId,
    customerId: props.customerId,
  });

  if (schedule && schedule.metafieldId) {
    await shopifyAdmin.request(DESTROY_SCHEDULE_METAFIELD, {
      variables: {
        metafieldId: schedule.metafieldId,
      },
    });
  }

  return ScheduleModel.deleteOne({
    _id: props.scheduleId,
    customerId: props.customerId,
  });
};

export const DESTROY_SCHEDULE_METAFIELD = `#graphql
  mutation destroyScheduleMetafield($metafieldId: ID!){
    metafieldDelete(input: {id: $metafieldId}) {
      deletedId
    }
  }
` as const;
