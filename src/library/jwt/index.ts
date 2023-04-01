import { HttpRequest, InvocationContext } from "@azure/functions";
import { sign, verify } from "jsonwebtoken";
import { AuthSession } from "../../functions/auth/auth.types";
import { User, UserRole } from "../../functions/user/user.types";

const secretOrPrivateKey = process.env["TokenSecret"] || "k12pke1p2ek12";
const options = { expiresIn: "1h" };

export const jwtCreateToken = (user: Pick<User, "_id" | "role" | "group">) => {
  return sign(
    {
      user: user._id.toString(),
      role: user.role,
      group: user.group,
      isOwner: user.role === UserRole.owner,
      isAdmin: user.role === UserRole.admin,
      isUser: user.role === UserRole.user,
    } as AuthSession,
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
