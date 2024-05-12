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
        title: user.username,
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

  await UserModel.updateOne(
    { _id: user._id },
    { collectionId: data?.collectionCreate?.collection?.handle }
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
  publications?.publications.nodes.map((pub) => {
    shopifyAdmin.request(PUBLISH_COLLECTION, {
      variables: {
        collectionId: collection.id,
        publicationId: pub.id,
      },
    });
  });

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
        sortOrder
        ruleSet {
          appliedDisjunctively
          rules {
            column
            relation
            condition
          }
        }
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
/*

{
  "title": "testelllrne",
  "condition": "user-testerne-username"
}

"data": {
    "collectionCreate": {
      "collection": {
        "handle": "testelllrne",
        "id": "gid://shopify/Collection/625004577095",
        "title": "testelllrne"
      },
      "userErrors": []
    }
  },

  {
  "data": {
    "publications": {
      "nodes": [
        {
          "id": "gid://shopify/Publication/100827824402",
          "name": "Online Store"
        },
        {
          "id": "gid://shopify/Publication/100833296658",
          "name": "Inbox"
        },
        {
          "id": "gid://shopify/Publication/109184483602",
          "name": "Shopify GraphiQL App"
        },
        {
          "id": "gid://shopify/Publication/124387754258",
          "name": "booking-api-and-storefront"
        },
        {
          "id": "gid://shopify/Publication/131001155858",
          "name": "Shop"
        },
        {
          "id": "gid://shopify/Publication/134703219015",
          "name": "Hydrogen"
        },
        {
          "id": "gid://shopify/Publication/175752184135",
          "name": "Google & YouTube"
        }
      ]
    }
  },
  "extensions": {
    "cost": {
      "requestedQueryCost": 6,
      "actualQueryCost": 5,
      "throttleStatus": {
        "maximumAvailable": 2000,
        "currentlyAvailable": 1995,
        "restoreRate": 100
      }
    }
  }
}

  */
