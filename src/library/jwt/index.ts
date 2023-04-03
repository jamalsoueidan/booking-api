import { HttpRequest, InvocationContext } from "@azure/functions";
import { sign, verify } from "jsonwebtoken";
import { Auth, AuthRole, AuthSession } from "../../functions/auth/auth.types";

const secretOrPrivateKey = process.env["TokenSecret"] || "k12pke1p2ek12";
const options = { expiresIn: "1h" };

// we should consider moving these methods to auth folder

export const jwtCreateToken = (auth: Auth) => {
  return sign(
    {
      authId: auth._id,
      userId: auth.userId,
      role: auth.role,
      group: auth.group,
      isOwner: auth.role === AuthRole.owner,
      isAdmin: auth.role === AuthRole.admin,
      isUser: auth.role === AuthRole.user,
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
