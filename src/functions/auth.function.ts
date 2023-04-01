import { app } from "@azure/functions";
import { _ } from "../library/handler";
import {
  AuthControllerCreateUser,
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

// should have authLEVEL API-key
app.http("authCreateUser", {
  methods: ["POST"],
  authLevel: "anonymous", // only for testing
  route: "auth/create-user",
  handler: _(AuthControllerCreateUser),
});
