import { shopifyAdmin } from "~/library/shopify";
import { FileInputProps, getFilenameFromUrl } from "./types";

export async function fileGetHandler(input: FileInputProps) {
  const { data } = await shopifyAdmin.request(FILE_GET, {
    variables: {
      query: getFilenameFromUrl(input.resourceUrl) || "",
    },
  });

  return data;
}

const FILE_GET = `#graphql
  query FileGet($query: String!) {
    files(first: 10, sortKey: UPDATED_AT, reverse: true, query: $query) {
      nodes {
        preview {
          image {
            url
            width
            height
          }
        }
      }
    }
  }
` as const;
