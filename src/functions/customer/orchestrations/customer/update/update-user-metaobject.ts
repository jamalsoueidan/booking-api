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

  const schedules = await UserScheduleServiceLocationsList({
    customerId,
  });

  // save unqiue locations across all schedule in user metafield
  const locations = schedules
    .map((item) => item.locations)
    .flat()
    .map((p) => p.metafieldId);

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
        key: "specialties",
        value: JSON.stringify({ specialties: user.specialties || [] }),
      },
      {
        key: "professions",
        value: JSON.stringify({ professions: user.professions || [] }),
      },
      {
        key: "speaks",
        value: JSON.stringify({ speaks: user.speaks || [] }),
      },
      {
        key: "social",
        value: JSON.stringify(user.social || []),
      },
      {
        key: "locations",
        value: JSON.stringify([...new Set(locations)]),
      },
      {
        key: "schedules",
        value: JSON.stringify(schedules.map((p) => p.metafieldId).sort()), //sort is for jest testing
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
