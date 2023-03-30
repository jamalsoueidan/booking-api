import { ControllerProps, ShopQuery } from "@jamalsoueidan/pkg.backend-types";
import { z } from "zod";
import {
  StaffServiceLoginAndCreateToken,
  StaffServiceLoginAndCreateTokenProps,
  StaffServiceReceivePassword,
} from "../../services/staff";

const PasswordPhoneBody = z.object({
  phone: z.string(),
});

type PasswordPhoneBody = z.infer<typeof PasswordPhoneBody>;

export async function passwordPhone({
  query,
  body,
}: ControllerProps<ShopQuery, PasswordPhoneBody>) {
  const { phone } = PasswordPhoneBody.parse(body);
  return StaffServiceReceivePassword({ shop: query.shop, phone });
}

export async function login({
  query,
  body,
}: ControllerProps<ShopQuery, StaffServiceLoginAndCreateTokenProps>) {
  const token = await StaffServiceLoginAndCreateToken({
    shop: query.shop,
    identification: body.identification,
    password: body.password,
  });
  return { token };
}
