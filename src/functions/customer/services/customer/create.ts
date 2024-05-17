import { User, UserModel } from "~/functions/user";
import { ShopifyError } from "~/library/handler";
import { shopifyAdmin } from "~/library/shopify";

export type CustomerServiceCreateBody = Omit<
  User,
  "_id" | "active" | "isBusiness"
>;

export const CustomerServiceCreate = async (
  body: CustomerServiceCreateBody
) => {
  const user = new UserModel({ ...body, isBusiness: true });
  const result = await user.save();

  const { data } = await shopifyAdmin.request(COLLECTION_CREATE, {
    variables: {
      input: {
        handle: user.username,
        title: `User > ${user.username}`,
        ruleSet: {
          appliedDisjunctively: false,
          rules: [
            {
              column: "TAG" as any,
              relation: "EQUALS" as any,
              condition: `user-${user.username}`,
            },
          ],
        },
      },
    },
  });

  const { data: metaobject } = await shopifyAdmin.request(
    CREATE_USER_METAOBJECT,
    {
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
            value: user.aboutMe || "",
          },
          {
            key: "professions",
            value: JSON.stringify(user.professions || []),
          },
          {
            key: "collection",
            value: data?.collectionCreate?.collection?.id || "",
          },
          {
            key: "theme",
            value: "pink",
          },
        ],
      },
    }
  );

  await UserModel.updateOne(
    { _id: user._id },
    {
      collectionMetaobjectId: data?.collectionCreate?.collection?.id,
      userMetaobjectId: metaobject?.metaobjectCreate?.metaobject?.id,
    }
  );

  const collection = data?.collectionCreate?.collection;

  if (!collection) {
    throw new ShopifyError([
      {
        path: ["shopify"],
        message: "GRAPHQL_ERROR",
        code: "custom",
      },
    ]);
  }

  const { data: publications } = await shopifyAdmin.request(PUBLICATIONS);
  if (publications) {
    await Promise.all(
      publications?.publications.nodes.map(async (pub) => {
        return shopifyAdmin.request(PUBLISH_COLLECTION, {
          variables: {
            collectionId: collection.id,
            publicationId: pub.id,
          },
        });
      })
    );
  }

  return result;
};

export const COLLECTION_CREATE = `#graphql
  mutation CollectionCreate($input: CollectionInput!) {
    collectionCreate(
      input: $input
    ) {
      collection {
        id
        title
        descriptionHtml
        handle
      }
    }
  }
` as const;

export const PUBLISH_COLLECTION = `#graphql
  mutation PublishablePublish($collectionId: ID!, $publicationId: ID!) {
    publishablePublish(id: $collectionId, input: {publicationId: $publicationId}) {
      publishable {
        ... on Collection {
          id
          handle
        }
      }
    }
  }
` as const;

export const PUBLICATIONS = `#graphql
  query publications {
    publications(first: 10, catalogType: APP) {
      nodes {
        id
      }
    }
  }
` as const;

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
