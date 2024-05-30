import { shopifyAdmin } from "~/library/shopify";
import { StringOrObjectIdType } from "~/library/zod";
import { CustomerScheduleServiceGet } from "../../../services/schedule/get";

export const createScheduleMetafieldName = "createScheduleMetafield";
export const createScheduleMetafield = async ({
  scheduleId,
  customerId,
}: {
  scheduleId: StringOrObjectIdType;
  customerId: number;
}) => {
  const schedule = await CustomerScheduleServiceGet({ scheduleId, customerId });

  const { data } = await shopifyAdmin().request(CREATE_SCHEDULE_METAOBJECT, {
    variables: {
      handle: schedule._id,
      fields: [
        {
          key: "name",
          value: schedule.name,
        },
        {
          key: "slots",
          value: JSON.stringify(schedule.slots),
        },
      ],
    },
  });

  if (!data?.metaobjectCreate?.metaobject) {
    throw new Error(`Failed to create metafield for location ${location}`);
  }

  schedule.metafieldId = data?.metaobjectCreate?.metaobject?.id;
  await schedule.save();

  return data.metaobjectCreate.metaobject;
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
