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

export type CollectionCreateMutationVariables = AdminTypes.Exact<{
  input: AdminTypes.CollectionInput;
}>;


export type CollectionCreateMutation = { collectionCreate?: AdminTypes.Maybe<{ collection?: AdminTypes.Maybe<(
      Pick<AdminTypes.Collection, 'id' | 'title' | 'descriptionHtml' | 'handle' | 'sortOrder'>
      & { ruleSet?: AdminTypes.Maybe<(
        Pick<AdminTypes.CollectionRuleSet, 'appliedDisjunctively'>
        & { rules: Array<Pick<AdminTypes.CollectionRule, 'column' | 'relation' | 'condition'>> }
      )> }
    )> }> };

export type PublishablePublishMutationVariables = AdminTypes.Exact<{
  collectionId: AdminTypes.Scalars['ID']['input'];
  publicationId: AdminTypes.Scalars['ID']['input'];
}>;


export type PublishablePublishMutation = { publishablePublish?: AdminTypes.Maybe<{ publishable?: AdminTypes.Maybe<Pick<AdminTypes.Collection, 'id' | 'handle'>> }> };

export type PublicationsQueryVariables = AdminTypes.Exact<{ [key: string]: never; }>;


export type PublicationsQuery = { publications: { nodes: Array<Pick<AdminTypes.Publication, 'id'>> } };

export type ProductOptionFragmentFragment = (
  Pick<AdminTypes.Product, 'id' | 'title' | 'handle' | 'tags'>
  & { parentId?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, variants: { nodes: Array<(
      Pick<AdminTypes.ProductVariant, 'id' | 'title' | 'price'>
      & { duration?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>> }
    )> } }
);

export type ProductOptionDuplicateMutationVariables = AdminTypes.Exact<{
  productId: AdminTypes.Scalars['ID']['input'];
  title: AdminTypes.Scalars['String']['input'];
}>;


export type ProductOptionDuplicateMutation = { productDuplicate?: AdminTypes.Maybe<{ newProduct?: AdminTypes.Maybe<(
      Pick<AdminTypes.Product, 'id' | 'title' | 'handle' | 'tags'>
      & { parentId?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, variants: { nodes: Array<(
          Pick<AdminTypes.ProductVariant, 'id' | 'title' | 'price'>
          & { duration?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>> }
        )> } }
    )> }> };

export type ProductOptionAddMutationVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
  metafields: Array<AdminTypes.MetafieldInput> | AdminTypes.MetafieldInput;
  tags: Array<AdminTypes.Scalars['String']['input']> | AdminTypes.Scalars['String']['input'];
}>;


export type ProductOptionAddMutation = { productUpdate?: AdminTypes.Maybe<{ product?: AdminTypes.Maybe<(
      Pick<AdminTypes.Product, 'id' | 'title' | 'handle' | 'tags'>
      & { parentId?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, variants: { nodes: Array<(
          Pick<AdminTypes.ProductVariant, 'id' | 'title' | 'price'>
          & { duration?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>> }
        )> } }
    )> }> };

export type ProductParentUpdateMutationVariables = AdminTypes.Exact<{
  id?: AdminTypes.InputMaybe<AdminTypes.Scalars['ID']['input']>;
  metafields?: AdminTypes.InputMaybe<Array<AdminTypes.MetafieldInput> | AdminTypes.MetafieldInput>;
}>;


export type ProductParentUpdateMutation = { productUpdate?: AdminTypes.Maybe<{ product?: AdminTypes.Maybe<{ options?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id'>> }> }> };

export type ProductOptionDestroyMutationVariables = AdminTypes.Exact<{
  productId: AdminTypes.Scalars['ID']['input'];
}>;


export type ProductOptionDestroyMutation = { productDelete?: AdminTypes.Maybe<Pick<AdminTypes.ProductDeletePayload, 'deletedProductId'>> };

export type ProductDestroyMetafieldMutationVariables = AdminTypes.Exact<{
  metafieldId: AdminTypes.Scalars['ID']['input'];
}>;


export type ProductDestroyMetafieldMutation = { metafieldDelete?: AdminTypes.Maybe<Pick<AdminTypes.MetafieldDeletePayload, 'deletedId'>> };

export type ProductOptionUpdateMutationVariables = AdminTypes.Exact<{
  productId: AdminTypes.Scalars['ID']['input'];
  variants?: AdminTypes.InputMaybe<Array<AdminTypes.ProductVariantsBulkInput> | AdminTypes.ProductVariantsBulkInput>;
}>;


export type ProductOptionUpdateMutation = { productVariantsBulkUpdate?: AdminTypes.Maybe<{ product?: AdminTypes.Maybe<(
      Pick<AdminTypes.Product, 'id' | 'title'>
      & { variants: { nodes: Array<(
          Pick<AdminTypes.ProductVariant, 'id' | 'title' | 'price'>
          & { duration?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>> }
        )> } }
    )> }> };

export type ProductFragmentFragment = (
  Pick<AdminTypes.Product, 'id' | 'handle' | 'tags'>
  & { variants: { nodes: Array<Pick<AdminTypes.ProductVariant, 'id' | 'compareAtPrice' | 'price'>> }, parentId?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, scheduleId?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, locations?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, bookingPeriodValue?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, bookingPeriodUnit?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, noticePeriodValue?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, noticePeriodUnit?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, duration?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, breaktime?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>> }
);

export type ProductDuplicateMutationVariables = AdminTypes.Exact<{
  productId: AdminTypes.Scalars['ID']['input'];
  title: AdminTypes.Scalars['String']['input'];
}>;


export type ProductDuplicateMutation = { productDuplicate?: AdminTypes.Maybe<{ newProduct?: AdminTypes.Maybe<(
      Pick<AdminTypes.Product, 'id' | 'handle' | 'tags'>
      & { variants: { nodes: Array<Pick<AdminTypes.ProductVariant, 'id' | 'compareAtPrice' | 'price'>> }, parentId?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, scheduleId?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, locations?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, bookingPeriodValue?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, bookingPeriodUnit?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, noticePeriodValue?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, noticePeriodUnit?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, duration?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, breaktime?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>> }
    )> }> };

export type ProductDestroyMutationVariables = AdminTypes.Exact<{
  productId: AdminTypes.Scalars['ID']['input'];
}>;


export type ProductDestroyMutation = { productDelete?: AdminTypes.Maybe<Pick<AdminTypes.ProductDeletePayload, 'deletedProductId'>> };

export type ProductUpdateMutationVariables = AdminTypes.Exact<{
  id?: AdminTypes.InputMaybe<AdminTypes.Scalars['ID']['input']>;
  metafields?: AdminTypes.InputMaybe<Array<AdminTypes.MetafieldInput> | AdminTypes.MetafieldInput>;
  tags?: AdminTypes.InputMaybe<Array<AdminTypes.Scalars['String']['input']> | AdminTypes.Scalars['String']['input']>;
}>;


export type ProductUpdateMutation = { productUpdate?: AdminTypes.Maybe<{ product?: AdminTypes.Maybe<(
      Pick<AdminTypes.Product, 'id' | 'handle' | 'tags'>
      & { variants: { nodes: Array<Pick<AdminTypes.ProductVariant, 'id' | 'compareAtPrice' | 'price'>> }, parentId?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, scheduleId?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, locations?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, bookingPeriodValue?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, bookingPeriodUnit?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, noticePeriodValue?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, noticePeriodUnit?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, duration?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>>, breaktime?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value'>> }
    )> }> };

export type ProductPricepdateMutationVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
  variants?: AdminTypes.InputMaybe<Array<AdminTypes.ProductVariantsBulkInput> | AdminTypes.ProductVariantsBulkInput>;
}>;


export type ProductPricepdateMutation = { productVariantsBulkUpdate?: AdminTypes.Maybe<{ product?: AdminTypes.Maybe<(
      Pick<AdminTypes.Product, 'id'>
      & { variants: { nodes: Array<Pick<AdminTypes.ProductVariant, 'id' | 'compareAtPrice' | 'price'>> } }
    )> }> };

export type ProductVariantsBulkDeleteMutationVariables = AdminTypes.Exact<{
  productId: AdminTypes.Scalars['ID']['input'];
  variantsIds: Array<AdminTypes.Scalars['ID']['input']> | AdminTypes.Scalars['ID']['input'];
}>;


export type ProductVariantsBulkDeleteMutation = { productVariantsBulkDelete?: AdminTypes.Maybe<{ product?: AdminTypes.Maybe<Pick<AdminTypes.Product, 'id' | 'title'>>, userErrors: Array<Pick<AdminTypes.ProductVariantsBulkDeleteUserError, 'code' | 'field' | 'message'>> }> };

interface GeneratedQueryTypes {
  "#graphql\n  query FileGet($query: String!) {\n    files(first: 10, sortKey: UPDATED_AT, reverse: true, query: $query) {\n      nodes {\n        preview {\n          image {\n            url\n            width\n            height\n          }\n        }\n      }\n    }\n  }\n": {return: FileGetQuery, variables: FileGetQueryVariables},
  "#graphql\n  query publications {\n    publications(first: 10, catalogType: APP) {\n      nodes {\n        id\n      }\n    }\n  }\n": {return: PublicationsQuery, variables: PublicationsQueryVariables},
}

interface GeneratedMutationTypes {
  "#graphql\n  mutation fileCreate($files: [FileCreateInput!]!) {\n    fileCreate(files: $files) {\n      files {\n        fileStatus\n        alt\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: FileCreateMutation, variables: FileCreateMutationVariables},
  "#graphql\n  mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {\n    stagedUploadsCreate(input: $input) {\n      stagedTargets {\n        resourceUrl\n        url\n        parameters {\n          name\n          value\n        }\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: StagedUploadsCreateMutation, variables: StagedUploadsCreateMutationVariables},
  "#graphql\n  mutation CollectionCreate($input: CollectionInput!) {\n    collectionCreate(\n      input: $input\n    ) {\n      collection {\n        id\n        title\n        descriptionHtml\n        handle\n        sortOrder\n        ruleSet {\n          appliedDisjunctively\n          rules {\n            column\n            relation\n            condition\n          }\n        }\n      }\n    }\n  }\n": {return: CollectionCreateMutation, variables: CollectionCreateMutationVariables},
  "#graphql\n  mutation PublishablePublish($collectionId: ID!, $publicationId: ID!) {\n    publishablePublish(id: $collectionId, input: {publicationId: $publicationId}) {\n      publishable {\n        ... on Collection {\n          id\n          handle\n        }\n      }\n    }\n  }\n": {return: PublishablePublishMutation, variables: PublishablePublishMutationVariables},
  "#graphql\n  #graphql\n  fragment ProductOptionFragment on Product {\n    id\n    title\n    handle\n    tags\n    parentId: metafield(key: \"parentId\", namespace: \"booking\") {\n      id\n      value\n    }\n    variants(first: 5) {\n      nodes {\n        id\n        title\n        price\n        duration: metafield(key: \"duration\", namespace: \"booking\") {\n          id\n          value\n        }\n      }\n    }\n  }\n\n  mutation productOptionDuplicate($productId: ID!, $title: String!) {\n    productDuplicate(newTitle: $title, productId: $productId) {\n      newProduct {\n        ...ProductOptionFragment\n      }\n    }\n  }\n": {return: ProductOptionDuplicateMutation, variables: ProductOptionDuplicateMutationVariables},
  "#graphql\n  #graphql\n  fragment ProductOptionFragment on Product {\n    id\n    title\n    handle\n    tags\n    parentId: metafield(key: \"parentId\", namespace: \"booking\") {\n      id\n      value\n    }\n    variants(first: 5) {\n      nodes {\n        id\n        title\n        price\n        duration: metafield(key: \"duration\", namespace: \"booking\") {\n          id\n          value\n        }\n      }\n    }\n  }\n\n  mutation ProductOptionAdd($id: ID!, $metafields: [MetafieldInput!]!, $tags: [String!]!) {\n    productUpdate(input: {id: $id, metafields: $metafields, tags: $tags}) {\n      product {\n        ...ProductOptionFragment\n      }\n    }\n  }\n": {return: ProductOptionAddMutation, variables: ProductOptionAddMutationVariables},
  "#graphql\n  mutation ProductParentUpdate($id: ID, $metafields: [MetafieldInput!]) {\n    productUpdate(input: {id: $id, metafields: $metafields}) {\n      product {\n        options: metafield(key: \"options\", namespace: \"booking\") {\n          id\n        }\n      }\n    }\n  }\n": {return: ProductParentUpdateMutation, variables: ProductParentUpdateMutationVariables},
  "#graphql\n  mutation productOptionDestroy($productId: ID!) {\n    productDelete(input: {id: $productId}) {\n      deletedProductId\n    }\n  }\n": {return: ProductOptionDestroyMutation, variables: ProductOptionDestroyMutationVariables},
  "#graphql\n  mutation productDestroyMetafield($metafieldId: ID!){\n    metafieldDelete(input: {id: $metafieldId}) {\n      deletedId\n    }\n  }\n": {return: ProductDestroyMetafieldMutation, variables: ProductDestroyMetafieldMutationVariables},
  "#graphql\n  mutation productOptionUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!] = {}) {\n  productVariantsBulkUpdate(\n    productId: $productId,\n    variants: $variants\n  ) {\n    product {\n      id\n      title\n      variants(first: 5) {\n        nodes {\n          id\n          title\n          price\n          duration: metafield(key: \"duration\", namespace: \"booking\") {\n            id\n            value\n          }\n        }\n      }\n    }\n  }\n}\n": {return: ProductOptionUpdateMutation, variables: ProductOptionUpdateMutationVariables},
  "#graphql\n  #graphql\n  fragment ProductFragment on Product {\n    id\n    handle\n    tags\n    variants(first: 1) {\n      nodes {\n        id\n        compareAtPrice\n        price\n      }\n    }\n    parentId: metafield(key: \"parentId\", namespace: \"booking\") {\n      id\n      value\n    }\n    scheduleId: metafield(key: \"scheduleId\", namespace: \"booking\") {\n      id\n      value\n    }\n    locations: metafield(key: \"locations\", namespace: \"booking\") {\n      id\n      value\n    }\n    bookingPeriodValue: metafield(key: \"booking_period_value\", namespace: \"booking\") {\n      id\n      value\n    }\n    bookingPeriodUnit: metafield(key: \"booking_period_unit\", namespace: \"booking\") {\n      id\n      value\n    }\n    noticePeriodValue: metafield(key: \"notice_period_value\", namespace: \"booking\") {\n      id\n      value\n    }\n    noticePeriodUnit: metafield(key: \"notice_period_unit\", namespace: \"booking\") {\n      id\n      value\n    }\n    duration: metafield(key: \"duration\", namespace: \"booking\") {\n      id\n      value\n    }\n    breaktime: metafield(key: \"breaktime\", namespace: \"booking\") {\n      id\n      value\n    }\n  }\n\n  mutation productDuplicate($productId: ID!, $title: String!) {\n    productDuplicate(newTitle: $title, productId: $productId, includeImages: true) {\n      newProduct {\n        ...ProductFragment\n      }\n    }\n  }\n": {return: ProductDuplicateMutation, variables: ProductDuplicateMutationVariables},
  "#graphql\n  mutation productDestroy($productId: ID!) {\n    productDelete(input: {id: $productId}) {\n      deletedProductId\n    }\n  }\n": {return: ProductDestroyMutation, variables: ProductDestroyMutationVariables},
  "#graphql\n  #graphql\n  fragment ProductFragment on Product {\n    id\n    handle\n    tags\n    variants(first: 1) {\n      nodes {\n        id\n        compareAtPrice\n        price\n      }\n    }\n    parentId: metafield(key: \"parentId\", namespace: \"booking\") {\n      id\n      value\n    }\n    scheduleId: metafield(key: \"scheduleId\", namespace: \"booking\") {\n      id\n      value\n    }\n    locations: metafield(key: \"locations\", namespace: \"booking\") {\n      id\n      value\n    }\n    bookingPeriodValue: metafield(key: \"booking_period_value\", namespace: \"booking\") {\n      id\n      value\n    }\n    bookingPeriodUnit: metafield(key: \"booking_period_unit\", namespace: \"booking\") {\n      id\n      value\n    }\n    noticePeriodValue: metafield(key: \"notice_period_value\", namespace: \"booking\") {\n      id\n      value\n    }\n    noticePeriodUnit: metafield(key: \"notice_period_unit\", namespace: \"booking\") {\n      id\n      value\n    }\n    duration: metafield(key: \"duration\", namespace: \"booking\") {\n      id\n      value\n    }\n    breaktime: metafield(key: \"breaktime\", namespace: \"booking\") {\n      id\n      value\n    }\n  }\n\n  mutation ProductUpdate($id: ID, $metafields: [MetafieldInput!], $tags: [String!]) {\n    productUpdate(input: {id: $id, metafields: $metafields, tags: $tags}) {\n      product {\n        ...ProductFragment\n      }\n    }\n  }\n": {return: ProductUpdateMutation, variables: ProductUpdateMutationVariables},
  "#graphql\n  mutation productPricepdate($id: ID!, $variants: [ProductVariantsBulkInput!] = {}) {\n    productVariantsBulkUpdate(\n      productId: $id,\n      variants: $variants\n    ) {\n      product {\n        id\n        variants(first: 1) {\n          nodes {\n            id\n            compareAtPrice\n            price\n          }\n        }\n      }\n    }\n  }\n": {return: ProductPricepdateMutation, variables: ProductPricepdateMutationVariables},
  "#graphql\n  mutation productVariantsBulkDelete($productId: ID!, $variantsIds: [ID!]!) {\n    productVariantsBulkDelete(productId: $productId, variantsIds: $variantsIds) {\n      product {\n        id\n        title\n      }\n      userErrors {\n        code\n        field\n        message\n      }\n    }\n  }\n": {return: ProductVariantsBulkDeleteMutation, variables: ProductVariantsBulkDeleteMutationVariables},
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
