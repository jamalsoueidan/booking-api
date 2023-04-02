import { app } from "@azure/functions";
import { _, onlyAdmin } from "../library/handler";
import { jwtVerify } from "../library/jwt";
import {
  UserControllerCreate,
  UserControllerGetAllUsers,
  UserControllerGetById,
  UserControllerUpdate,
} from "./user/user.controller";

app.http("userGetAll", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user",
  handler: _(jwtVerify, UserControllerGetAllUsers),
});

app.http("userCreate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "user",
  handler: _(jwtVerify, onlyAdmin, UserControllerCreate),
});

app.http("userGetById", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/:id",
  handler: _(jwtVerify, UserControllerGetById),
});

app.http("userUpdateById", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "user/:id",
  handler: _(jwtVerify, onlyAdmin, UserControllerUpdate),
});
