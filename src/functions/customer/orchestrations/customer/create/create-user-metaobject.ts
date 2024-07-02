import { User } from "~/functions/user";
import { shopifyAdmin } from "~/library/shopify";

export const createUserMetaobjectName = "createUserMetaobject";
export const createUserMetaobject = async ({
  user,
  collectionId,
}: {
  user: Omit<User, "_id">;
  collectionId: string;
}) => {
  const { data } = await shopifyAdmin().request(CREATE_USER_METAOBJECT, {
    variables: {
      handle: user.username,
      fields: [
        {
          key: "username",
          value: user.username,
        },
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
          key: "languages",
          value: JSON.stringify({ languages: user.languages || [] }),
        },
        {
          key: "collection",
          value: collectionId,
        },
        {
          key: "theme",
          value: "pink",
        },
        {
          key: "active",
          value: "False",
        },
      ],
    },
  });

  if (!data?.metaobjectCreate?.metaobject) {
    throw new Error(`Failed to create collection for user ${user.username}`);
  }

  return data.metaobjectCreate.metaobject;
};

export const CREATE_USER_METAOBJECT = `#graphql
  mutation CreateUserMetaobject($handle: String!, $fields: [MetaobjectFieldInput!]) {
    metaobjectCreate(
      metaobject: {type: "user", fields: $fields, handle: $handle, capabilities: {publishable: {status: ACTIVE}}}
    ) {
      metaobject {
        id
        type
        fields {
          value
          key
        }
      }
      userErrors {
        code
        field
        message
      }
    }
  }
` as const;
