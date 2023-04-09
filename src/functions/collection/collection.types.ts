import { ProductServiceGetAllProduct } from "../product";

export interface Collection {
  _id: string;
  shop: string;
  title: string;
  collectionId: number;
}

export interface CollectionServiceGetAllReturn extends Collection {
  products: ProductServiceGetAllProduct[];
}

export interface CollectionServiceCreateBodyProps {
  selections: string[];
}

export type CollectionServiceDestroyProps = {
  id: string;
};

export type CollectionServiceGetAllProps = {
  group?: string;
};
