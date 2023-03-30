import {
  StaffModel,
  StaffServiceCreateNewPassword,
  StaffServiceLogin,
} from "@jamalsoueidan/backend.services.staff";

import { ShopQuery } from "@jamalsoueidan/pkg.backend-types";
import { z } from "zod";
import { jwtCreateToken } from "../../lib/jwt";

export type StaffServiceLoginAndCreateTokenProps = {
  identification: string;
  password: string;
};

export const StaffServiceLoginAndCreateToken = async (
  props: StaffServiceLoginAndCreateTokenProps & ShopQuery
) => {
  const staff = await StaffServiceLogin(props);
  if (!staff) {
    throw new Error("wrong user/password");
  }
  return jwtCreateToken(staff);
};

export const StaffServiceReceivePasswordProps = z.object({
  shop: z.string(),
  phone: z.string(),
});

export type StaffServiceReceivePasswordProps = z.infer<
  typeof StaffServiceReceivePasswordProps
>;

export const StaffServiceReceivePassword = async ({
  shop,
  phone,
}: StaffServiceReceivePasswordProps) => {
  const staff = await StaffModel.findOne({
    shop,
    phone,
  });

  if (!staff) {
    throw { message: "phone number not exist" };
  }

  const password = await StaffServiceCreateNewPassword(staff);

  /*SmsDkApiSend({
      receiver: staff.phone,
      message: `Din adgangskode: ${password}`,
    });*/

  return {
    message: "Check your phone",
    ...(process.env["AZURE_FUNCTIONS_ENVIRONMENT"] === "Development"
      ? { password }
      : {}),
  };
};
