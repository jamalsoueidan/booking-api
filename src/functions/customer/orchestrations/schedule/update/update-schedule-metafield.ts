import { shopifyAdmin } from "~/library/shopify";
import { StringOrObjectIdType } from "~/library/zod";
import { CustomerScheduleServiceGet } from "../../../services/schedule/get";

export const updateScheduleMetafieldName = "updateScheduleMetafield";
export const updateScheduleMetafield = async ({
  scheduleId,
  customerId,
}: {
  scheduleId: StringOrObjectIdType;
  customerId: number;
}) => {
  const schedule = await CustomerScheduleServiceGet({ scheduleId, customerId });

  if (!schedule.metafieldId) {
    throw new Error(
      `Failed to update schedule metafield for schedule ${schedule._id}`
    );
  }

  const { data } = await shopifyAdmin().request(UPDATE_SCHEDULE_METAOBJECT, {
    variables: {
      id: schedule.metafieldId,
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

  if (!data?.metaobjectUpdate?.metaobject) {
    throw new Error(
      `Failed to update schedule metafield for schedule ${schedule._id}`
    );
  }

  return data?.metaobjectUpdate.metaobject;
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
