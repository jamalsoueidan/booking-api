import { ProductServiceGetAllProduct } from "../product";

export interface Collection {
  _id: string;
  hidden: boolean;
  title: string;
  collectionId: number;
  imageUrl: string;
  productIds: number[];
}

export interface CollectionServiceGetAllReturn extends Collection {
  products: ProductServiceGetAllProduct[];
}
