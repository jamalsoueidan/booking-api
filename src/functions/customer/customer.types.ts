export interface Customer {
  _id: string;
  customerId: number;
  firstName: string;
  lastName: string;
  fullname: string;
  email: string;
  phone: string;
}

export type CustomerServiceFindAndUpdateProps = {
  customerGraphqlApiId: string;
  customerId: number;
};
