/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import * as AdminTypes from './admin.types';

export type FileCreateMutationVariables = AdminTypes.Exact<{
  files: Array<AdminTypes.FileCreateInput> | AdminTypes.FileCreateInput;
}>;


export type FileCreateMutation = { fileCreate?: AdminTypes.Maybe<{ files?: AdminTypes.Maybe<Array<Pick<AdminTypes.GenericFile, 'fileStatus' | 'alt'> | Pick<AdminTypes.MediaImage, 'fileStatus' | 'alt'> | Pick<AdminTypes.Video, 'fileStatus' | 'alt'>>>, userErrors: Array<Pick<AdminTypes.FilesUserError, 'field' | 'message'>> }> };

export type FileGetQueryVariables = AdminTypes.Exact<{
  query: AdminTypes.Scalars['String']['input'];
}>;


export type FileGetQuery = { files: { nodes: Array<{ preview?: AdminTypes.Maybe<{ image?: AdminTypes.Maybe<Pick<AdminTypes.Image, 'url' | 'width' | 'height'>> }> }> } };

export type StagedUploadsCreateMutationVariables = AdminTypes.Exact<{
  input: Array<AdminTypes.StagedUploadInput> | AdminTypes.StagedUploadInput;
}>;


export type StagedUploadsCreateMutation = { stagedUploadsCreate?: AdminTypes.Maybe<{ stagedTargets?: AdminTypes.Maybe<Array<(
      Pick<AdminTypes.StagedMediaUploadTarget, 'resourceUrl' | 'url'>
      & { parameters: Array<Pick<AdminTypes.StagedUploadParameter, 'name' | 'value'>> }
    )>>, userErrors: Array<Pick<AdminTypes.UserError, 'field' | 'message'>> }> };

export type ProductVariantCreateMutationVariables = AdminTypes.Exact<{
  input: AdminTypes.ProductVariantInput;
}>;


export type ProductVariantCreateMutation = { productVariantCreate?: AdminTypes.Maybe<{ productVariant?: AdminTypes.Maybe<(
      Pick<AdminTypes.ProductVariant, 'id' | 'title' | 'price' | 'compareAtPrice'>
      & { product: Pick<AdminTypes.Product, 'id' | 'handle'>, selectedOptions: Array<Pick<AdminTypes.SelectedOption, 'name' | 'value'>> }
    )>, userErrors: Array<Pick<AdminTypes.UserError, 'field' | 'message'>> }> };

export type ProductVariantsBulkDeleteMutationVariables = AdminTypes.Exact<{
  productId: AdminTypes.Scalars['ID']['input'];
  variantsIds: Array<AdminTypes.Scalars['ID']['input']> | AdminTypes.Scalars['ID']['input'];
}>;


export type ProductVariantsBulkDeleteMutation = { productVariantsBulkDelete?: AdminTypes.Maybe<{ product?: AdminTypes.Maybe<Pick<AdminTypes.Product, 'id' | 'title'>>, userErrors: Array<Pick<AdminTypes.ProductVariantsBulkDeleteUserError, 'code' | 'field' | 'message'>> }> };

interface GeneratedQueryTypes {
  "#graphql\n  query FileGet($query: String!) {\n    files(first: 10, sortKey: UPDATED_AT, reverse: true, query: $query) {\n      nodes {\n        preview {\n          image {\n            url\n            width\n            height\n          }\n        }\n      }\n    }\n  }\n": {return: FileGetQuery, variables: FileGetQueryVariables},
}

interface GeneratedMutationTypes {
  "#graphql\n  mutation fileCreate($files: [FileCreateInput!]!) {\n    fileCreate(files: $files) {\n      files {\n        fileStatus\n        alt\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: FileCreateMutation, variables: FileCreateMutationVariables},
  "#graphql\n  mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {\n    stagedUploadsCreate(input: $input) {\n      stagedTargets {\n        resourceUrl\n        url\n        parameters {\n          name\n          value\n        }\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: StagedUploadsCreateMutation, variables: StagedUploadsCreateMutationVariables},
  "#graphql\n  mutation productVariantCreate($input: ProductVariantInput!) {\n    productVariantCreate(input: $input) {\n      productVariant {\n        product {\n          id\n          handle\n        }\n        id\n        title\n        selectedOptions {\n          name\n          value\n        }\n        price\n        compareAtPrice\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: ProductVariantCreateMutation, variables: ProductVariantCreateMutationVariables},
  "#graphql\n  mutation productVariantsBulkDelete($productId: ID!, $variantsIds: [ID!]!) {\n    productVariantsBulkDelete(productId: $productId, variantsIds: $variantsIds) {\n      product {\n        id\n        title\n      }\n      userErrors {\n        code\n        field\n        message\n      }\n    }\n  }\n": {return: ProductVariantsBulkDeleteMutation, variables: ProductVariantsBulkDeleteMutationVariables},
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
