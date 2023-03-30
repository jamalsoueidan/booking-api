import { app } from "@azure/functions";
import { _ } from "../lib/handler/middlewares";
import { jwtVerify } from "../lib/jwt";
import { getAccount } from "./account/account.controller";
import {
  login,
  passwordPhone,
} from "./authentication/authentication.controller";

app.http("login", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: _(login),
});

app.http("password-phone", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "password-phone",
  handler: _(passwordPhone),
});

app.http("account", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "account",
  handler: _(jwtVerify, getAccount),
});
