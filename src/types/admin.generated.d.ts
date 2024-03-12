/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import * as AdminTypes from "./admin.types";

export type ProductVariantCreateMutationVariables = AdminTypes.Exact<{
  input: AdminTypes.ProductVariantInput;
}>;

export type ProductVariantCreateMutation = {
  productVariantCreate?: AdminTypes.Maybe<{
    product?: AdminTypes.Maybe<Pick<AdminTypes.Product, "id" | "title">>;
    productVariant?: AdminTypes.Maybe<
      Pick<
        AdminTypes.ProductVariant,
        | "createdAt"
        | "displayName"
        | "id"
        | "inventoryPolicy"
        | "inventoryQuantity"
        | "price"
        | "title"
      > & { product: Pick<AdminTypes.Product, "id"> }
    >;
    userErrors: Array<Pick<AdminTypes.UserError, "field" | "message">>;
  }>;
};

export type FileCreateMutationVariables = AdminTypes.Exact<{
  files: Array<AdminTypes.FileCreateInput> | AdminTypes.FileCreateInput;
}>;

export type FileCreateMutation = {
  fileCreate?: AdminTypes.Maybe<{
    files?: AdminTypes.Maybe<
      Array<
        | Pick<AdminTypes.GenericFile, "fileStatus" | "alt">
        | Pick<AdminTypes.MediaImage, "fileStatus" | "alt">
        | Pick<AdminTypes.Video, "fileStatus" | "alt">
      >
    >;
    userErrors: Array<Pick<AdminTypes.FilesUserError, "field" | "message">>;
  }>;
};

export type FileGetQueryVariables = AdminTypes.Exact<{
  query: AdminTypes.Scalars["String"]["input"];
}>;

export type FileGetQuery = {
  files: {
    nodes: Array<{
      preview?: AdminTypes.Maybe<{
        image?: AdminTypes.Maybe<
          Pick<AdminTypes.Image, "url" | "width" | "height">
        >;
      }>;
    }>;
  };
};

export type StagedUploadsCreateMutationVariables = AdminTypes.Exact<{
  input: Array<AdminTypes.StagedUploadInput> | AdminTypes.StagedUploadInput;
}>;

export type StagedUploadsCreateMutation = {
  stagedUploadsCreate?: AdminTypes.Maybe<{
    stagedTargets?: AdminTypes.Maybe<
      Array<
        Pick<AdminTypes.StagedMediaUploadTarget, "resourceUrl" | "url"> & {
          parameters: Array<
            Pick<AdminTypes.StagedUploadParameter, "name" | "value">
          >;
        }
      >
    >;
    userErrors: Array<Pick<AdminTypes.UserError, "field" | "message">>;
  }>;
};

interface GeneratedQueryTypes {
  "#graphql\n  query FileGet($query: String!) {\n    files(first: 10, sortKey: UPDATED_AT, reverse: true, query: $query) {\n      nodes {\n        preview {\n          image {\n            url\n            width\n            height\n          }\n        }\n      }\n    }\n  }\n": {
    return: FileGetQuery;
    variables: FileGetQueryVariables;
  };
}

interface GeneratedMutationTypes {
  "#graphql\n  mutation productVariantCreate($input: ProductVariantInput!) {\n    productVariantCreate(input: $input) {\n      product {\n        id\n        title\n      }\n      productVariant {\n        createdAt\n        displayName\n        id\n        inventoryPolicy\n        inventoryQuantity\n        price\n        product {\n          id\n        }\n        title\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {
    return: ProductVariantCreateMutation;
    variables: ProductVariantCreateMutationVariables;
  };
  "#graphql\n  mutation fileCreate($files: [FileCreateInput!]!) {\n    fileCreate(files: $files) {\n      files {\n        fileStatus\n        alt\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {
    return: FileCreateMutation;
    variables: FileCreateMutationVariables;
  };
  "#graphql\n  mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {\n    stagedUploadsCreate(input: $input) {\n      stagedTargets {\n        resourceUrl\n        url\n        parameters {\n          name\n          value\n        }\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {
    return: StagedUploadsCreateMutation;
    variables: StagedUploadsCreateMutationVariables;
  };
}
declare module "@shopify/admin-api-client" {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
