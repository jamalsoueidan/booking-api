import { app } from "@azure/functions";
import {
  getAccount,
  getSettings,
  updateAccount,
  updateSettings,
} from "../controllers/my.controller";
import { _ } from "../lib/handler/middlewares";
import { jwtVerify } from "../lib/jwt";

app.http("accountPost", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "my/account",
  handler: _(jwtVerify, updateAccount),
});

app.http("accountGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "my/account",
  handler: _(jwtVerify, getAccount),
});

app.http("settingsPost", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "my/settings",
  handler: _(jwtVerify, updateSettings),
});

app.http("settingsGet", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "my/settings",
  handler: _(jwtVerify, getSettings),
});
