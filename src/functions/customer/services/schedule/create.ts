import { Schedule, ScheduleModel } from "~/functions/schedule";
import { shopifyAdmin } from "~/library/shopify";

export type CustomerScheduleServiceCreateBody = Pick<
  Schedule,
  "name" | "customerId"
> &
  Pick<Partial<Schedule>, "products">;

export const CustomerScheduleServiceCreate = async (
  props: CustomerScheduleServiceCreateBody
) => {
  const newSchedule = new ScheduleModel({
    ...props,
    slots: [
      {
        day: "monday",
        intervals: [
          {
            from: "08:00",
            to: "16:00",
          },
        ],
      },
    ],
  });
  const scheduleModel = await newSchedule.save();

  const { data } = await shopifyAdmin.request(CREATE_SCHEDULE_METAOBJECT, {
    variables: {
      handle: scheduleModel._id,
      fields: [
        {
          key: "name",
          value: scheduleModel.name,
        },
        {
          key: "slots",
          value: JSON.stringify(scheduleModel.slots),
        },
      ],
    },
  });

  scheduleModel.metafieldId = data?.metaobjectCreate?.metaobject?.id;
  return scheduleModel.save();
};

export const CREATE_SCHEDULE_METAOBJECT = `#graphql
  mutation CreateScheduleMetaobject($handle: String!, $fields: [MetaobjectFieldInput!]) {
    metaobjectCreate(
      metaobject: {type: "schedule", fields: $fields, handle: $handle, capabilities: {publishable: {status: ACTIVE}}}
    ) {
      metaobject {
        id
        type
        fields {
          value
          key
        }
      }
    }
  }
` as const;
