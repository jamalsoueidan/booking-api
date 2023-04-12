import { SessionKey, _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";

export const ShopifyControllerCreateOrUpdate = _(
  jwtVerify,
  ({ body, session }: SessionKey<{ body: {} }>) => {}
);
