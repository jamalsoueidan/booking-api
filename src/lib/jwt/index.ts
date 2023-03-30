import { HttpRequest, InvocationContext } from "@azure/functions";
import { AppSession, Staff, StaffRole } from "@jamalsoueidan/pkg.backend-types";
import { sign, verify } from "jsonwebtoken";

const secretOrPrivateKey = process.env["TokenSecret"] || "k12pke1p2ek12";
const options = { expiresIn: "1h" };

export const jwtCreateToken = (
  staff: Pick<Staff, "_id" | "shop" | "role" | "group">
) => {
  return sign(
    {
      staff: staff._id.toString(),
      shop: staff.shop,
      role: staff.role,
      group: staff.group,
      isOwner: staff.role === StaffRole.owner,
      isAdmin: staff.role === StaffRole.admin,
      isUser: staff.role === StaffRole.user,
    } as AppSession,
    secretOrPrivateKey,
    options
  );
};

export const jwtVerify = async (
  request: HttpRequest,
  context: InvocationContext
) => {
  const token = jwtGetToken(request.headers);
  if (!token) {
    throw new Error("unauthorized");
  }

  verify(token, secretOrPrivateKey);
};

export const jwtGetToken = (headers: HttpRequest["headers"]) => {
  const authHeader = headers.get("authorization") || "";
  return authHeader && authHeader.split(" ")[1];
};

export const jwtDecode = (token: string) => verify(token, secretOrPrivateKey);
