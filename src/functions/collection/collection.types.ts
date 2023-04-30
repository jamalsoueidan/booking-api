export interface Collection {
  _id: string;
  hidden: boolean;
  title: string;
  collectionId: number;
  image: {
    url: string;
    width: number;
    height: number;
  };
  productIds: number[];
}
