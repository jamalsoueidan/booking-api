/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import * as AdminTypes from "./admin.types";
export type FileCreateMutationVariables = AdminTypes.Exact<{
  files: Array<AdminTypes.FileCreateInput> | AdminTypes.FileCreateInput;
}>;

export type FileCreateMutation = {
  fileCreate?: AdminTypes.Maybe<{
    files?: AdminTypes.Maybe<
      Array<
        | Pick<AdminTypes.GenericFile, "id" | "alt" | "fileStatus">
        | Pick<AdminTypes.MediaImage, "id" | "alt" | "fileStatus">
        | Pick<AdminTypes.Video, "id" | "alt" | "fileStatus">
      >
    >;
  }>;
};

export type FileGetQueryVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars["ID"]["input"];
}>;

export type FileGetQuery = {
  node?: AdminTypes.Maybe<{
    preview?: AdminTypes.Maybe<{
      image?: AdminTypes.Maybe<
        Pick<AdminTypes.Image, "url" | "width" | "height">
      >;
    }>;
  }>;
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

export type CollectionCreateMutationVariables = AdminTypes.Exact<{
  input: AdminTypes.CollectionInput;
}>;

export type CollectionCreateMutation = {
  collectionCreate?: AdminTypes.Maybe<{
    collection?: AdminTypes.Maybe<
      Pick<AdminTypes.Collection, "id" | "title" | "descriptionHtml" | "handle">
    >;
  }>;
};

export type CreateUserMetaobjectMutationVariables = AdminTypes.Exact<{
  handle: AdminTypes.Scalars["String"]["input"];
  fields?: AdminTypes.InputMaybe<
    Array<AdminTypes.MetaobjectFieldInput> | AdminTypes.MetaobjectFieldInput
  >;
}>;

export type CreateUserMetaobjectMutation = {
  metaobjectCreate?: AdminTypes.Maybe<{
    metaobject?: AdminTypes.Maybe<
      Pick<AdminTypes.Metaobject, "id" | "type"> & {
        fields: Array<Pick<AdminTypes.MetaobjectField, "value" | "key">>;
      }
    >;
    userErrors: Array<
      Pick<AdminTypes.MetaobjectUserError, "code" | "field" | "message">
    >;
  }>;
};

export type PublicationsQueryVariables = AdminTypes.Exact<{
  [key: string]: never;
}>;

export type PublicationsQuery = {
  publications: { nodes: Array<Pick<AdminTypes.Publication, "id">> };
};

export type PublishablePublishMutationVariables = AdminTypes.Exact<{
  collectionId: AdminTypes.Scalars["ID"]["input"];
  publicationId: AdminTypes.Scalars["ID"]["input"];
}>;

export type PublishablePublishMutation = {
  publishablePublish?: AdminTypes.Maybe<{
    publishable?: AdminTypes.Maybe<
      Pick<AdminTypes.Collection, "id" | "handle">
    >;
  }>;
};

export type UpdateUserMetaobjectMutationVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars["ID"]["input"];
  fields:
    | Array<AdminTypes.MetaobjectFieldInput>
    | AdminTypes.MetaobjectFieldInput;
}>;

export type UpdateUserMetaobjectMutation = {
  metaobjectUpdate?: AdminTypes.Maybe<{
    metaobject?: AdminTypes.Maybe<{
      fields: Array<Pick<AdminTypes.MetaobjectField, "value" | "key">>;
    }>;
  }>;
};

export type CreateLocationMetaobjectMutationVariables = AdminTypes.Exact<{
  handle: AdminTypes.Scalars["String"]["input"];
  fields?: AdminTypes.InputMaybe<
    Array<AdminTypes.MetaobjectFieldInput> | AdminTypes.MetaobjectFieldInput
  >;
}>;

export type CreateLocationMetaobjectMutation = {
  metaobjectCreate?: AdminTypes.Maybe<{
    metaobject?: AdminTypes.Maybe<
      Pick<AdminTypes.Metaobject, "id" | "type"> & {
        fields: Array<Pick<AdminTypes.MetaobjectField, "value" | "key">>;
      }
    >;
  }>;
};

export type UpdateLocationMetaobjectMutationVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars["ID"]["input"];
  fields:
    | Array<AdminTypes.MetaobjectFieldInput>
    | AdminTypes.MetaobjectFieldInput;
}>;

export type UpdateLocationMetaobjectMutation = {
  metaobjectUpdate?: AdminTypes.Maybe<{
    metaobject?: AdminTypes.Maybe<{
      fields: Array<Pick<AdminTypes.MetaobjectField, "value" | "key">>;
    }>;
  }>;
};

export type ProductParentUpdateMutationVariables = AdminTypes.Exact<{
  id?: AdminTypes.InputMaybe<AdminTypes.Scalars["ID"]["input"]>;
  metafields?: AdminTypes.InputMaybe<
    Array<AdminTypes.MetafieldInput> | AdminTypes.MetafieldInput
  >;
}>;

export type ProductParentUpdateMutation = {
  productUpdate?: AdminTypes.Maybe<{
    product?: AdminTypes.Maybe<{
      options?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id">>;
    }>;
  }>;
};

export type ProductOptionAddMutationVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars["ID"]["input"];
  metafields: Array<AdminTypes.MetafieldInput> | AdminTypes.MetafieldInput;
  tags:
    | Array<AdminTypes.Scalars["String"]["input"]>
    | AdminTypes.Scalars["String"]["input"];
}>;

export type ProductOptionAddMutation = {
  productUpdate?: AdminTypes.Maybe<{
    product?: AdminTypes.Maybe<
      Pick<AdminTypes.Product, "id" | "title" | "handle" | "tags"> & {
        required?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
        parentId?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
        variants: {
          nodes: Array<
            Pick<AdminTypes.ProductVariant, "id" | "title" | "price"> & {
              duration?: AdminTypes.Maybe<
                Pick<AdminTypes.Metafield, "id" | "value">
              >;
            }
          >;
        };
      }
    >;
  }>;
};

export type ProductOptionDestroyMutationVariables = AdminTypes.Exact<{
  productId: AdminTypes.Scalars["ID"]["input"];
}>;

export type ProductOptionDestroyMutation = {
  productDelete?: AdminTypes.Maybe<
    Pick<AdminTypes.ProductDeletePayload, "deletedProductId">
  >;
};

export type ProductDestroyMutationVariables = AdminTypes.Exact<{
  productId: AdminTypes.Scalars["ID"]["input"];
}>;

export type ProductDestroyMutation = {
  productDelete?: AdminTypes.Maybe<
    Pick<AdminTypes.ProductDeletePayload, "deletedProductId">
  >;
};

export type ProductPricepdateMutationVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars["ID"]["input"];
  variants?: AdminTypes.InputMaybe<
    | Array<AdminTypes.ProductVariantsBulkInput>
    | AdminTypes.ProductVariantsBulkInput
  >;
}>;

export type ProductPricepdateMutation = {
  productVariantsBulkUpdate?: AdminTypes.Maybe<{
    product?: AdminTypes.Maybe<
      Pick<AdminTypes.Product, "id"> & {
        variants: {
          nodes: Array<
            Pick<AdminTypes.ProductVariant, "id" | "compareAtPrice" | "price">
          >;
        };
      }
    >;
  }>;
};

export type UpdateProductFragmentFragment = Pick<
  AdminTypes.Product,
  "id" | "handle" | "tags" | "title"
> & {
  variants: {
    nodes: Array<
      Pick<AdminTypes.ProductVariant, "id" | "compareAtPrice" | "price">
    >;
  };
  default?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
  active?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
  user?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
  hideFromCombine?: AdminTypes.Maybe<
    Pick<AdminTypes.Metafield, "id" | "value">
  >;
  hideFromProfile?: AdminTypes.Maybe<
    Pick<AdminTypes.Metafield, "id" | "value">
  >;
  parentId?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
  scheduleId?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
  locations?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
  bookingPeriodValue?: AdminTypes.Maybe<
    Pick<AdminTypes.Metafield, "id" | "value">
  >;
  bookingPeriodUnit?: AdminTypes.Maybe<
    Pick<AdminTypes.Metafield, "id" | "value">
  >;
  noticePeriodValue?: AdminTypes.Maybe<
    Pick<AdminTypes.Metafield, "id" | "value">
  >;
  noticePeriodUnit?: AdminTypes.Maybe<
    Pick<AdminTypes.Metafield, "id" | "value">
  >;
  duration?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
  breaktime?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
};

export type ProductUpdateMutationVariables = AdminTypes.Exact<{
  id?: AdminTypes.InputMaybe<AdminTypes.Scalars["ID"]["input"]>;
  metafields?: AdminTypes.InputMaybe<
    Array<AdminTypes.MetafieldInput> | AdminTypes.MetafieldInput
  >;
  tags?: AdminTypes.InputMaybe<
    | Array<AdminTypes.Scalars["String"]["input"]>
    | AdminTypes.Scalars["String"]["input"]
  >;
  title?: AdminTypes.InputMaybe<AdminTypes.Scalars["String"]["input"]>;
  descriptionHtml?: AdminTypes.InputMaybe<
    AdminTypes.Scalars["String"]["input"]
  >;
}>;

export type ProductUpdateMutation = {
  productUpdate?: AdminTypes.Maybe<{
    product?: AdminTypes.Maybe<
      Pick<AdminTypes.Product, "id" | "handle" | "tags" | "title"> & {
        variants: {
          nodes: Array<
            Pick<AdminTypes.ProductVariant, "id" | "compareAtPrice" | "price">
          >;
        };
        default?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
        active?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
        user?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
        hideFromCombine?: AdminTypes.Maybe<
          Pick<AdminTypes.Metafield, "id" | "value">
        >;
        hideFromProfile?: AdminTypes.Maybe<
          Pick<AdminTypes.Metafield, "id" | "value">
        >;
        parentId?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
        scheduleId?: AdminTypes.Maybe<
          Pick<AdminTypes.Metafield, "id" | "value">
        >;
        locations?: AdminTypes.Maybe<
          Pick<AdminTypes.Metafield, "id" | "value">
        >;
        bookingPeriodValue?: AdminTypes.Maybe<
          Pick<AdminTypes.Metafield, "id" | "value">
        >;
        bookingPeriodUnit?: AdminTypes.Maybe<
          Pick<AdminTypes.Metafield, "id" | "value">
        >;
        noticePeriodValue?: AdminTypes.Maybe<
          Pick<AdminTypes.Metafield, "id" | "value">
        >;
        noticePeriodUnit?: AdminTypes.Maybe<
          Pick<AdminTypes.Metafield, "id" | "value">
        >;
        duration?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
        breaktime?: AdminTypes.Maybe<
          Pick<AdminTypes.Metafield, "id" | "value">
        >;
      }
    >;
  }>;
};

export type UpdateScheduleLocationsFieldMutationVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars["ID"]["input"];
  fields:
    | Array<AdminTypes.MetaobjectFieldInput>
    | AdminTypes.MetaobjectFieldInput;
}>;

export type UpdateScheduleLocationsFieldMutation = {
  metaobjectUpdate?: AdminTypes.Maybe<{
    metaobject?: AdminTypes.Maybe<{
      fields: Array<Pick<AdminTypes.MetaobjectField, "value" | "key">>;
    }>;
  }>;
};

export type CreateScheduleMetaobjectMutationVariables = AdminTypes.Exact<{
  handle: AdminTypes.Scalars["String"]["input"];
  fields?: AdminTypes.InputMaybe<
    Array<AdminTypes.MetaobjectFieldInput> | AdminTypes.MetaobjectFieldInput
  >;
}>;

export type CreateScheduleMetaobjectMutation = {
  metaobjectCreate?: AdminTypes.Maybe<{
    metaobject?: AdminTypes.Maybe<
      Pick<AdminTypes.Metaobject, "id" | "type"> & {
        fields: Array<Pick<AdminTypes.MetaobjectField, "value" | "key">>;
      }
    >;
  }>;
};

export type UpdateScheduleMetaobjectMutationVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars["ID"]["input"];
  fields:
    | Array<AdminTypes.MetaobjectFieldInput>
    | AdminTypes.MetaobjectFieldInput;
}>;

export type UpdateScheduleMetaobjectMutation = {
  metaobjectUpdate?: AdminTypes.Maybe<{
    metaobject?: AdminTypes.Maybe<{
      fields: Array<Pick<AdminTypes.MetaobjectField, "value" | "key">>;
    }>;
  }>;
};

export type ProductOptionFragmentFragment = Pick<
  AdminTypes.Product,
  "id" | "title" | "handle" | "tags"
> & {
  required?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
  parentId?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
  variants: {
    nodes: Array<
      Pick<AdminTypes.ProductVariant, "id" | "title" | "price"> & {
        duration?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
      }
    >;
  };
};

export type ProductOptionDuplicateMutationVariables = AdminTypes.Exact<{
  productId: AdminTypes.Scalars["ID"]["input"];
  title: AdminTypes.Scalars["String"]["input"];
}>;

export type ProductOptionDuplicateMutation = {
  productDuplicate?: AdminTypes.Maybe<{
    newProduct?: AdminTypes.Maybe<
      Pick<AdminTypes.Product, "id" | "title" | "handle" | "tags"> & {
        required?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
        parentId?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
        variants: {
          nodes: Array<
            Pick<AdminTypes.ProductVariant, "id" | "title" | "price"> & {
              duration?: AdminTypes.Maybe<
                Pick<AdminTypes.Metafield, "id" | "value">
              >;
            }
          >;
        };
      }
    >;
  }>;
};

export type ProductOptionUpdateMutationVariables = AdminTypes.Exact<{
  productId: AdminTypes.Scalars["ID"]["input"];
  variants?: AdminTypes.InputMaybe<
    | Array<AdminTypes.ProductVariantsBulkInput>
    | AdminTypes.ProductVariantsBulkInput
  >;
}>;

export type ProductOptionUpdateMutation = {
  productVariantsBulkUpdate?: AdminTypes.Maybe<{
    product?: AdminTypes.Maybe<
      Pick<AdminTypes.Product, "id" | "title"> & {
        variants: {
          nodes: Array<
            Pick<AdminTypes.ProductVariant, "id" | "title" | "price"> & {
              duration?: AdminTypes.Maybe<
                Pick<AdminTypes.Metafield, "id" | "value">
              >;
            }
          >;
        };
      }
    >;
  }>;
};

export type ProductFragmentFragment = Pick<
  AdminTypes.Product,
  "id" | "handle" | "tags" | "title"
> & {
  variants: {
    nodes: Array<
      Pick<AdminTypes.ProductVariant, "id" | "compareAtPrice" | "price">
    >;
  };
  default?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
  active?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
  user?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
  hideFromCombine?: AdminTypes.Maybe<
    Pick<AdminTypes.Metafield, "id" | "value">
  >;
  hideFromProfile?: AdminTypes.Maybe<
    Pick<AdminTypes.Metafield, "id" | "value">
  >;
  parentId?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
  scheduleId?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
  locations?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
  bookingPeriodValue?: AdminTypes.Maybe<
    Pick<AdminTypes.Metafield, "id" | "value">
  >;
  bookingPeriodUnit?: AdminTypes.Maybe<
    Pick<AdminTypes.Metafield, "id" | "value">
  >;
  noticePeriodValue?: AdminTypes.Maybe<
    Pick<AdminTypes.Metafield, "id" | "value">
  >;
  noticePeriodUnit?: AdminTypes.Maybe<
    Pick<AdminTypes.Metafield, "id" | "value">
  >;
  duration?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
  breaktime?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
};

export type ProductDuplicateMutationVariables = AdminTypes.Exact<{
  productId: AdminTypes.Scalars["ID"]["input"];
  title: AdminTypes.Scalars["String"]["input"];
}>;

export type ProductDuplicateMutation = {
  productDuplicate?: AdminTypes.Maybe<{
    newProduct?: AdminTypes.Maybe<
      Pick<AdminTypes.Product, "id" | "handle" | "tags" | "title"> & {
        variants: {
          nodes: Array<
            Pick<AdminTypes.ProductVariant, "id" | "compareAtPrice" | "price">
          >;
        };
        default?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
        active?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
        user?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
        hideFromCombine?: AdminTypes.Maybe<
          Pick<AdminTypes.Metafield, "id" | "value">
        >;
        hideFromProfile?: AdminTypes.Maybe<
          Pick<AdminTypes.Metafield, "id" | "value">
        >;
        parentId?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
        scheduleId?: AdminTypes.Maybe<
          Pick<AdminTypes.Metafield, "id" | "value">
        >;
        locations?: AdminTypes.Maybe<
          Pick<AdminTypes.Metafield, "id" | "value">
        >;
        bookingPeriodValue?: AdminTypes.Maybe<
          Pick<AdminTypes.Metafield, "id" | "value">
        >;
        bookingPeriodUnit?: AdminTypes.Maybe<
          Pick<AdminTypes.Metafield, "id" | "value">
        >;
        noticePeriodValue?: AdminTypes.Maybe<
          Pick<AdminTypes.Metafield, "id" | "value">
        >;
        noticePeriodUnit?: AdminTypes.Maybe<
          Pick<AdminTypes.Metafield, "id" | "value">
        >;
        duration?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, "id" | "value">>;
        breaktime?: AdminTypes.Maybe<
          Pick<AdminTypes.Metafield, "id" | "value">
        >;
      }
    >;
  }>;
};

export type DestroyScheduleMetafieldMutationVariables = AdminTypes.Exact<{
  metafieldId: AdminTypes.Scalars["ID"]["input"];
}>;

export type DestroyScheduleMetafieldMutation = {
  metafieldDelete?: AdminTypes.Maybe<
    Pick<AdminTypes.MetafieldDeletePayload, "deletedId">
  >;
};

export type CollectionFragmentFragment = Pick<
  AdminTypes.Collection,
  "id" | "title" | "description"
> & {
  ruleSet?: AdminTypes.Maybe<{
    rules: Array<Pick<AdminTypes.CollectionRule, "column" | "condition">>;
  }>;
};

export type CollectionsQueryVariables = AdminTypes.Exact<{
  [key: string]: never;
}>;

export type CollectionsQuery = {
  collections: {
    nodes: Array<
      Pick<AdminTypes.Collection, "id" | "title" | "description"> & {
        ruleSet?: AdminTypes.Maybe<{
          rules: Array<Pick<AdminTypes.CollectionRule, "column" | "condition">>;
        }>;
      }
    >;
  };
};

interface GeneratedQueryTypes {
  "#graphql\n  query FileGet($id: ID!) {\n    node(id: $id) {\n      ... on MediaImage {\n        preview {\n          image {\n            url\n            width\n            height\n          }\n        }\n      }\n    }\n  }\n": {
    return: FileGetQuery;
    variables: FileGetQueryVariables;
  };
  "#graphql\n  query publications {\n    publications(first: 10, catalogType: APP) {\n      nodes {\n        id\n      }\n    }\n  }\n": {
    return: PublicationsQuery;
    variables: PublicationsQueryVariables;
  };
  '#graphql\n  #graphql\n  fragment CollectionFragment on Collection {\n    id\n    title\n    description\n    ruleSet {\n      rules {\n        column\n        condition\n      }\n    }\n  }\n\n  query collections {\n    collections(first: 250, query: "-Alle AND -Subcategory AND -User") {\n      nodes {\n        ...CollectionFragment\n      }\n    }\n  }\n': {
    return: CollectionsQuery;
    variables: CollectionsQueryVariables;
  };
}

interface GeneratedMutationTypes {
  "#graphql\n  mutation fileCreate($files: [FileCreateInput!]!) {\n    fileCreate(files: $files) {\n      files {\n        id\n        alt\n        fileStatus\n      }\n    }\n  }\n": {
    return: FileCreateMutation;
    variables: FileCreateMutationVariables;
  };
  "#graphql\n  mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {\n    stagedUploadsCreate(input: $input) {\n      stagedTargets {\n        resourceUrl\n        url\n        parameters {\n          name\n          value\n        }\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {
    return: StagedUploadsCreateMutation;
    variables: StagedUploadsCreateMutationVariables;
  };
  "#graphql\n  mutation CollectionCreate($input: CollectionInput!) {\n    collectionCreate(\n      input: $input\n    ) {\n      collection {\n        id\n        title\n        descriptionHtml\n        handle\n      }\n    }\n  }\n": {
    return: CollectionCreateMutation;
    variables: CollectionCreateMutationVariables;
  };
  '#graphql\n  mutation CreateUserMetaobject($handle: String!, $fields: [MetaobjectFieldInput!]) {\n    metaobjectCreate(\n      metaobject: {type: "user", fields: $fields, handle: $handle, capabilities: {publishable: {status: ACTIVE}}}\n    ) {\n      metaobject {\n        id\n        type\n        fields {\n          value\n          key\n        }\n      }\n      userErrors {\n        code\n        field\n        message\n      }\n    }\n  }\n': {
    return: CreateUserMetaobjectMutation;
    variables: CreateUserMetaobjectMutationVariables;
  };
  "#graphql\n  mutation PublishablePublish($collectionId: ID!, $publicationId: ID!) {\n    publishablePublish(id: $collectionId, input: {publicationId: $publicationId}) {\n      publishable {\n        ... on Collection {\n          id\n          handle\n        }\n      }\n    }\n  }\n": {
    return: PublishablePublishMutation;
    variables: PublishablePublishMutationVariables;
  };
  "#graphql\n  mutation UpdateUserMetaobject($id: ID!, $fields: [MetaobjectFieldInput!]!) {\n    metaobjectUpdate(id: $id, metaobject: {fields: $fields}) {\n      metaobject {\n        fields {\n          value\n          key\n        }\n      }\n    }\n  }\n": {
    return: UpdateUserMetaobjectMutation;
    variables: UpdateUserMetaobjectMutationVariables;
  };
  '#graphql\n  mutation CreateLocationMetaobject($handle: String!, $fields: [MetaobjectFieldInput!]) {\n    metaobjectCreate(\n      metaobject: {type: "location", fields: $fields, handle: $handle, capabilities: {publishable: {status: ACTIVE}}}\n    ) {\n      metaobject {\n        id\n        type\n        fields {\n          value\n          key\n        }\n      }\n    }\n  }\n': {
    return: CreateLocationMetaobjectMutation;
    variables: CreateLocationMetaobjectMutationVariables;
  };
  "#graphql\n  mutation UpdateLocationMetaobject($id: ID!, $fields: [MetaobjectFieldInput!]!) {\n    metaobjectUpdate(id: $id, metaobject: {fields: $fields}) {\n      metaobject {\n        fields {\n          value\n          key\n        }\n      }\n    }\n  }\n": {
    return: UpdateLocationMetaobjectMutation;
    variables: UpdateLocationMetaobjectMutationVariables;
  };
  '#graphql\n  mutation ProductParentUpdate($id: ID, $metafields: [MetafieldInput!]) {\n    productUpdate(input: {id: $id, metafields: $metafields}) {\n      product {\n        options: metafield(key: "options", namespace: "booking") {\n          id\n        }\n      }\n    }\n  }\n': {
    return: ProductParentUpdateMutation;
    variables: ProductParentUpdateMutationVariables;
  };
  '#graphql\n  #graphql\n  fragment ProductOptionFragment on Product {\n    id\n    title\n    handle\n    tags\n    required: metafield(key: "required", namespace: "system") {\n      id\n      value\n    }\n    parentId: metafield(key: "parentId", namespace: "booking") {\n      id\n      value\n    }\n    variants(first: 5) {\n      nodes {\n        id\n        title\n        price\n        duration: metafield(key: "duration", namespace: "booking") {\n          id\n          value\n        }\n      }\n    }\n  }\n\n  mutation ProductOptionAdd($id: ID!, $metafields: [MetafieldInput!]!, $tags: [String!]!) {\n    productUpdate(input: {id: $id, metafields: $metafields, tags: $tags}) {\n      product {\n        ...ProductOptionFragment\n      }\n    }\n  }\n': {
    return: ProductOptionAddMutation;
    variables: ProductOptionAddMutationVariables;
  };
  "#graphql\n  mutation productOptionDestroy($productId: ID!) {\n    productDelete(input: {id: $productId}) {\n      deletedProductId\n    }\n  }\n": {
    return: ProductOptionDestroyMutation;
    variables: ProductOptionDestroyMutationVariables;
  };
  "#graphql\n  mutation productDestroy($productId: ID!) {\n    productDelete(input: {id: $productId}) {\n      deletedProductId\n    }\n  }\n": {
    return: ProductDestroyMutation;
    variables: ProductDestroyMutationVariables;
  };
  "#graphql\n  mutation productPricepdate($id: ID!, $variants: [ProductVariantsBulkInput!] = {}) {\n    productVariantsBulkUpdate(\n      productId: $id,\n      variants: $variants\n    ) {\n      product {\n        id\n        variants(first: 1) {\n          nodes {\n            id\n            compareAtPrice\n            price\n          }\n        }\n      }\n    }\n  }\n": {
    return: ProductPricepdateMutation;
    variables: ProductPricepdateMutationVariables;
  };
  '#graphql\n  #graphql\n  fragment ProductFragment on Product {\n    id\n    handle\n    tags\n    title\n    variants(first: 1) {\n      nodes {\n        id\n        compareAtPrice\n        price\n      }\n    }\n    default: metafield(key: "default", namespace: "system") {\n      id\n      value\n    }\n    active: metafield(key: "active", namespace: "system") {\n      id\n      value\n    }\n    user: metafield(key: "user", namespace: "booking") {\n      id\n      value\n    }\n    hideFromCombine: metafield(key: "hide_from_combine", namespace: "booking") {\n      id\n      value\n    }\n    hideFromProfile: metafield(key: "hide_from_profile", namespace: "booking") {\n      id\n      value\n    }\n    parentId: metafield(key: "parentId", namespace: "booking") {\n      id\n      value\n    }\n    scheduleId: metafield(key: "scheduleId", namespace: "booking") {\n      id\n      value\n    }\n    locations: metafield(key: "locations", namespace: "booking") {\n      id\n      value\n    }\n    bookingPeriodValue: metafield(key: "booking_period_value", namespace: "booking") {\n      id\n      value\n    }\n    bookingPeriodUnit: metafield(key: "booking_period_unit", namespace: "booking") {\n      id\n      value\n    }\n    noticePeriodValue: metafield(key: "notice_period_value", namespace: "booking") {\n      id\n      value\n    }\n    noticePeriodUnit: metafield(key: "notice_period_unit", namespace: "booking") {\n      id\n      value\n    }\n    duration: metafield(key: "duration", namespace: "booking") {\n      id\n      value\n    }\n    breaktime: metafield(key: "breaktime", namespace: "booking") {\n      id\n      value\n    }\n  }\n\n  mutation ProductUpdate($id: ID, $metafields: [MetafieldInput!], $tags: [String!], $title: String, $descriptionHtml: String) {\n    productUpdate(input: {id: $id, metafields: $metafields, tags: $tags, title: $title, descriptionHtml: $descriptionHtml}) {\n      product {\n        ...UpdateProductFragment\n      }\n    }\n  }\n': {
    return: ProductUpdateMutation;
    variables: ProductUpdateMutationVariables;
  };
  "#graphql\n  mutation UpdateScheduleLocationsField($id: ID!, $fields: [MetaobjectFieldInput!]!) {\n    metaobjectUpdate(id: $id, metaobject: {fields: $fields}) {\n      metaobject {\n        fields {\n          value\n          key\n        }\n      }\n    }\n  }\n": {
    return: UpdateScheduleLocationsFieldMutation;
    variables: UpdateScheduleLocationsFieldMutationVariables;
  };
  '#graphql\n  mutation CreateScheduleMetaobject($handle: String!, $fields: [MetaobjectFieldInput!]) {\n    metaobjectCreate(\n      metaobject: {type: "schedule", fields: $fields, handle: $handle, capabilities: {publishable: {status: ACTIVE}}}\n    ) {\n      metaobject {\n        id\n        type\n        fields {\n          value\n          key\n        }\n      }\n    }\n  }\n': {
    return: CreateScheduleMetaobjectMutation;
    variables: CreateScheduleMetaobjectMutationVariables;
  };
  "#graphql\n  mutation UpdateScheduleMetaobject($id: ID!, $fields: [MetaobjectFieldInput!]!) {\n    metaobjectUpdate(id: $id, metaobject: {fields: $fields}) {\n      metaobject {\n        fields {\n          value\n          key\n        }\n      }\n    }\n  }\n": {
    return: UpdateScheduleMetaobjectMutation;
    variables: UpdateScheduleMetaobjectMutationVariables;
  };
  '#graphql\n  #graphql\n  fragment ProductOptionFragment on Product {\n    id\n    title\n    handle\n    tags\n    required: metafield(key: "required", namespace: "system") {\n      id\n      value\n    }\n    parentId: metafield(key: "parentId", namespace: "booking") {\n      id\n      value\n    }\n    variants(first: 5) {\n      nodes {\n        id\n        title\n        price\n        duration: metafield(key: "duration", namespace: "booking") {\n          id\n          value\n        }\n      }\n    }\n  }\n\n  mutation productOptionDuplicate($productId: ID!, $title: String!) {\n    productDuplicate(newTitle: $title, productId: $productId, includeImages: true) {\n      newProduct {\n        ...ProductOptionFragment\n      }\n    }\n  }\n': {
    return: ProductOptionDuplicateMutation;
    variables: ProductOptionDuplicateMutationVariables;
  };
  '#graphql\n  mutation productOptionUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!] = {}) {\n  productVariantsBulkUpdate(\n    productId: $productId,\n    variants: $variants\n  ) {\n    product {\n      id\n      title\n      variants(first: 5) {\n        nodes {\n          id\n          title\n          price\n          duration: metafield(key: "duration", namespace: "booking") {\n            id\n            value\n          }\n        }\n      }\n    }\n  }\n}\n': {
    return: ProductOptionUpdateMutation;
    variables: ProductOptionUpdateMutationVariables;
  };
  '#graphql\n  #graphql\n  fragment ProductFragment on Product {\n    id\n    handle\n    tags\n    title\n    variants(first: 1) {\n      nodes {\n        id\n        compareAtPrice\n        price\n      }\n    }\n    default: metafield(key: "default", namespace: "system") {\n      id\n      value\n    }\n    active: metafield(key: "active", namespace: "system") {\n      id\n      value\n    }\n    user: metafield(key: "user", namespace: "booking") {\n      id\n      value\n    }\n    hideFromCombine: metafield(key: "hide_from_combine", namespace: "booking") {\n      id\n      value\n    }\n    hideFromProfile: metafield(key: "hide_from_profile", namespace: "booking") {\n      id\n      value\n    }\n    parentId: metafield(key: "parentId", namespace: "booking") {\n      id\n      value\n    }\n    scheduleId: metafield(key: "scheduleId", namespace: "booking") {\n      id\n      value\n    }\n    locations: metafield(key: "locations", namespace: "booking") {\n      id\n      value\n    }\n    bookingPeriodValue: metafield(key: "booking_period_value", namespace: "booking") {\n      id\n      value\n    }\n    bookingPeriodUnit: metafield(key: "booking_period_unit", namespace: "booking") {\n      id\n      value\n    }\n    noticePeriodValue: metafield(key: "notice_period_value", namespace: "booking") {\n      id\n      value\n    }\n    noticePeriodUnit: metafield(key: "notice_period_unit", namespace: "booking") {\n      id\n      value\n    }\n    duration: metafield(key: "duration", namespace: "booking") {\n      id\n      value\n    }\n    breaktime: metafield(key: "breaktime", namespace: "booking") {\n      id\n      value\n    }\n  }\n\n  mutation productDuplicate($productId: ID!, $title: String!) {\n    productDuplicate(newTitle: $title, productId: $productId, includeImages: true) {\n      newProduct {\n        ...ProductFragment\n      }\n    }\n  }\n': {
    return: ProductDuplicateMutation;
    variables: ProductDuplicateMutationVariables;
  };
  "#graphql\n  mutation destroyScheduleMetafield($metafieldId: ID!){\n    metafieldDelete(input: {id: $metafieldId}) {\n      deletedId\n    }\n  }\n": {
    return: DestroyScheduleMetafieldMutation;
    variables: DestroyScheduleMetafieldMutationVariables;
  };
}
declare module "@shopify/admin-api-client" {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
