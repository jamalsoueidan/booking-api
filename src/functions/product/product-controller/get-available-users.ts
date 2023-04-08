import {
  ProductServiceGetAvailableUsers,
  ProductServiceGetAvailableUsersReturn,
} from "../product.service";

export type ProductControllerGetAvailableUsersRequest = {
  query: { group?: string };
};

export type ProductControllerGetAllResponse =
  ProductServiceGetAvailableUsersReturn;

export const ProductControllerGetAvailableUsers = ({
  query,
}: ProductControllerGetAvailableUsersRequest) => {
  return ProductServiceGetAvailableUsers(query.group);
};
