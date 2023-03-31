import { app } from "@azure/functions";
import {
  createStaff,
  login,
  passwordPhone,
} from "../controllers/auth.controller";
import { _ } from "../lib/handler/middlewares";

app.http("login", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "auth/login",
  handler: _(login),
});

app.http("receivePassword", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "auth/receive-password",
  handler: _(passwordPhone),
});

/* should have authLEVEL API-key */
app.http("createStaff", {
  methods: ["POST"],
  authLevel: "anonymous", // only for testing
  route: "auth/create-staff",
  handler: _(createStaff),
});
