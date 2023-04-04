import "module-alias/register";

import { app } from "@azure/functions";
import { _ } from "~/library/handler";
import {
  AuthControllerLogin,
  AuthControllerReceivePassword,
} from "./auth/auth.controller";

app.http("authLogin", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "auth/login",
  handler: _(AuthControllerLogin),
});

app.http("authRceivePassword", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "auth/receive-password",
  handler: _(AuthControllerReceivePassword),
});
