import { shopifyAdmin } from "~/library/shopify";

export const publishCollectionName = "publishCollection";
export const publishCollection = async ({
  collectionId,
}: {
  collectionId: string;
}) => {
  const { data } = await shopifyAdmin.request(PUBLICATIONS);

  if (!data?.publications.nodes) {
    throw new Error(`Failed to find any publichations for ${collectionId}`);
  }

  await Promise.all(
    data.publications.nodes.map(async (pub) => {
      return shopifyAdmin.request(PUBLISH_COLLECTION, {
        variables: {
          collectionId: collectionId,
          publicationId: pub.id,
        },
      });
    })
  );

  return data?.publications.nodes;
};

export const PUBLICATIONS = `#graphql
  query publications {
    publications(first: 10, catalogType: APP) {
      nodes {
        id
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
