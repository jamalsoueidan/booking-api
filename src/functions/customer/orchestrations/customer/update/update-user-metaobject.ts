import { UserScheduleServiceLocationsList } from "~/functions//user/services/schedule/locations-list";
import { CustomerServiceGet } from "~/functions/customer/services/customer/get";
import { shopifyAdmin } from "~/library/shopify";

export const updateUserMetaobjectName = "updateUserMetaobject";
export const updateUserMetaobject = async ({
  customerId,
}: {
  customerId: number;
}) => {
  const user = await CustomerServiceGet({ customerId });

  const schedule = await UserScheduleServiceLocationsList({
    customerId,
  });

  const locations = schedule.map((item) => item.locations).flat();

  const variables = {
    id: user.userMetaobjectId || "",
    fields: [
      {
        key: "fullname",
        value: user.fullname,
      },
      {
        key: "short_description",
        value: user.shortDescription || "",
      },
      {
        key: "about_me",
        value: user.aboutMeHtml || "",
      },
      {
        key: "professions",
        value: JSON.stringify(user.professions || []),
      },
      {
        key: "social",
        value: JSON.stringify(user.social || []),
      },
      {
        key: "locations",
        value: JSON.stringify(locations.map((p) => p.metafieldId)),
      },
      {
        key: "active",
        value: String(user.active),
      },
      {
        key: "theme",
        value: user.theme?.color || "pink",
      },
      ...(user.images?.profile?.metaobjectId
        ? [
            {
              key: "image",
              value: user.images?.profile?.metaobjectId,
            },
          ]
        : []),
    ],
  };

  const { data } = await shopifyAdmin().request(UPDATE_USER_METAOBJECT, {
    variables,
  });

  if (!data?.metaobjectUpdate?.metaobject) {
    throw new Error(`Failed to update user metaobject ${user.username}`);
  }

  return data?.metaobjectUpdate?.metaobject;
};

export const UPDATE_USER_METAOBJECT = `#graphql
  mutation UpdateUserMetaobject($id: ID!, $fields: [MetaobjectFieldInput!]!) {
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
