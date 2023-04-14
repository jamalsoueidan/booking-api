import "module-alias/register";

import { app } from "@azure/functions";
import {
  UserControllerCreateUser,
  UserControllerGetAllUsers,
  UserControllerGetById,
  UserControllerUpdate,
} from "./user";

app.http("userGetAll", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "users",
  handler: UserControllerGetAllUsers,
});

app.http("userCreateUser", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "user",
  handler: UserControllerCreateUser,
});

app.http("userGetById", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "user/{_id?}",
  handler: UserControllerGetById,
});

app.http("userUpdateById", {
  methods: ["PUT"],
  authLevel: "anonymous",
  route: "user/{_id?}",
  handler: UserControllerUpdate,
});
