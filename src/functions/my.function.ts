import { app } from "@azure/functions";
import "module-alias/register";
import { _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import {
  MyControllerGetAccount,
  MyControllerGetSettings,
  MyControllerUpdateAccount,
  MyControllerUpdateSettings,
} from "./my/my.controller";

app.http("myAccountUpdate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "my/account",
  handler: _(jwtVerify, MyControllerUpdateAccount),
});

app.http("myAccountRead", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "my/account",
  handler: _(jwtVerify, MyControllerGetAccount),
});

app.http("mySettingsUpdate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "my/settings",
  handler: _(jwtVerify, MyControllerUpdateSettings),
});

app.http("mySettingsRead", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "my/settings",
  handler: _(jwtVerify, MyControllerGetSettings),
});
