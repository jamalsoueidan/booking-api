import { shopifyAdmin } from "~/library/shopify";
import { FileInputProps, getFilenameFromUrl } from "./types";

export async function fileCreateHandler(input: FileInputProps) {
  const { data } = await shopifyAdmin.request(FILE_CREATE, {
    variables: {
      files: {
        alt: getFilenameFromUrl(input.resourceUrl),
        contentType: "IMAGE" as any,
        originalSource: input.resourceUrl,
      },
    },
  });

  return data;
}

const FILE_CREATE = `#graphql
  mutation fileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        fileStatus
        alt
      }
      userErrors {
        field
        message
      }
    }
  }
` as const;
