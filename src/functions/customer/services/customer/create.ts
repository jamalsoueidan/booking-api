import { User, UserModel } from "~/functions/user";

export type CustomerServiceCreateBody = Omit<
  User,
  "_id" | "active" | "isBusiness"
>;

export const CustomerServiceCreate = async (
  body: CustomerServiceCreateBody
) => {
  const user = new UserModel({ ...body, isBusiness: true });
  return user.save();
};

export const COLLECTION_CREATE = `#graphql
  mutation MyMutation($title: String, $condition: String!) {
    collectionCreate(
      input: {title: $title, ruleSet: {column: TAG, relation: EQUALS, condition: $condition}, appliedDisjunctively: false}}
    ) {
      collection {
        handle
        id
        title
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;

export const PUBLISH_COLLECTION = `#graphql
  mutation MyMutation($collectionId: ID!, $publicationId: ID) {
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
 publications(first: 10, catalogType: APP) {
    nodes {
      id
      name
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
