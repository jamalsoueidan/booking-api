import { shopifyAdmin } from "~/library/shopify";
import { FileInputProps, getFilenameFromUrl } from "./types";

export async function fileCreateHandler(input: FileInputProps) {
  const { data } = await shopifyAdmin().request(FILE_CREATE, {
    variables: {
      files: {
        alt: getFilenameFromUrl(input.resourceUrl),
        contentType: "IMAGE" as any,
        originalSource: input.resourceUrl,
      },
    },
  });

  if (!data?.fileCreate?.files) {
    throw new Error("Error");
  }

  return data.fileCreate.files[0];
}

const FILE_CREATE = `#graphql
  mutation fileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        id
        alt
        fileStatus
      }
    }
  }
` as const;
