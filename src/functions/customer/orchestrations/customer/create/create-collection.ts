import { User } from "~/functions/user";
import { shopifyAdmin } from "~/library/shopify";

export const createCollection = async ({
  user,
}: {
  user: Pick<User, "username">;
}) => {
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
            {
              column: "TAG" as any,
              relation: "EQUALS" as any,
              condition: `treatments`,
            },
          ],
        },
      },
    },
  });

  if (!data?.collectionCreate?.collection) {
    throw new Error(`Failed to create collection for user ${user.username}`);
  }

  return data.collectionCreate.collection;
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
