import { app } from "@azure/functions";
import { _ } from "../lib/handler/middlewares";
import { jwtVerify } from "../lib/jwt";
import { getAccount, updateAccount } from "./account/account.controller";

app.http("account", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "account",
  handler: _(jwtVerify, updateAccount),
});

app.http("account", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "account",
  handler: _(jwtVerify, getAccount),
});
