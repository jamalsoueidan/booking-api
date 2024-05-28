import { Schedule, ScheduleModel } from "~/functions/schedule";
import { NotFoundError } from "~/library/handler";
import { shopifyAdmin } from "~/library/shopify";

export type ScheduleServiceUpdateProps = {
  scheduleId: Schedule["_id"];
  customerId: Schedule["customerId"];
};

export type CustomerScheduleServiceUpdateBody = Pick<Schedule, "name">;

export const CustomerScheduleServiceUpdate = async (
  filter: ScheduleServiceUpdateProps,
  body: CustomerScheduleServiceUpdateBody
) => {
  const updatedSchedule = await ScheduleModel.findOneAndUpdate(
    { _id: filter.scheduleId, customerId: filter.customerId },
    body,
    {
      new: true,
    }
  ).orFail(
    new NotFoundError([
      {
        code: "custom",
        message: "SCHEDULE_NOT_FOUND",
        path: ["schedule"],
      },
    ])
  );

  if (updatedSchedule.metafieldId) {
    await shopifyAdmin().request(UPDATE_SCHEDULE_METAOBJECT, {
      variables: {
        id: updatedSchedule.metafieldId,
        fields: [
          {
            key: "name",
            value: updatedSchedule.name,
          },
        ],
      },
    });
  }

  return updatedSchedule;
};

export const UPDATE_SCHEDULE_METAOBJECT = `#graphql
  mutation UpdateScheduleMetaobject($id: ID!, $fields: [MetaobjectFieldInput!]!) {
    metaobjectUpdate(id: $id, metaobject: {fields: $fields}) {
      metaobject {
        fields {
          value
          key
        }
      }
    }
  }
` as const;
