import { app } from "@azure/functions";
import { _ } from "../lib/handler/middlewares";
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
