import { User } from "~/functions/user";
import { shopifyAdmin } from "~/library/shopify";

export const updateUserMetaobject = async ({
  user,
}: {
  user: Omit<User, "_id">;
}) => {
  const { data } = await shopifyAdmin.request(UPDATE_USER_METAOBJECT, {
    variables: {
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
          value: JSON.stringify(user.social),
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
    },
  });

  if (!data?.metaobjectUpdate?.metaobject) {
    throw new Error(`Failed to create collection for user ${user.username}`);
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
