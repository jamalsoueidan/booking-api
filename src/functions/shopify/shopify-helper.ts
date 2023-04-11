export const ShopifyHelperGetId = (value: string): number => {
  return parseInt(value.substring(value.lastIndexOf("/") + 1), 10);
};
